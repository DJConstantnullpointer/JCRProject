package hu.educatio.jcr;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.jcr.*;
import javax.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class JcrController {

    @Autowired
    private Repository repository;

    private Session getSession(HttpServletRequest request) throws RepositoryException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Basic ")) {
            String base64Credentials = authHeader.substring("Basic ".length()).trim();
            byte[] credDecoded = Base64.getDecoder().decode(base64Credentials);
            String credentials = new String(credDecoded, StandardCharsets.UTF_8);
            // credentials = username:password
            final String[] values = credentials.split(":", 2);
            if (values.length == 2) {
                return repository.login(new SimpleCredentials(values[0], values[1].toCharArray()));
            }
        }
        throw new RepositoryException("Unauthorized");
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest loginRequest) {
        try {
            Session session = repository.login(new SimpleCredentials(loginRequest.getUsername(), loginRequest.getPassword().toCharArray()));
            session.logout();
            Map<String, String> result = new HashMap<>();
            result.put("status", "ok");
            return ResponseEntity.ok(result);
        } catch (RepositoryException e) {
            Map<String, String> result = new HashMap<>();
            result.put("status", "error");
            result.put("message", "Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
    }

    @GetMapping("/nodes")
    public List<Map<String, Object>> getNodes(@RequestParam(defaultValue = "/oh") String path, HttpServletRequest request) throws RepositoryException {
        Session session = getSession(request);
        try {
            path = getAdjustedPath(session, path);
            Node node = session.getNode(path);
            List<Map<String, Object>> result = new ArrayList<>();
            NodeIterator nodes = node.getNodes();
            while (nodes.hasNext()) {
                Node child = nodes.nextNode();
                Map<String, Object> nodeMap = new HashMap<>();
                nodeMap.put("name", child.getName());
                nodeMap.put("path", child.getPath());
                nodeMap.put("hasNodes", child.hasNodes());
                result.add(nodeMap);
            }
            return result;
        } finally {
            session.logout();
        }
    }

    @GetMapping("/properties")
    public Map<String, String> getProperties(@RequestParam(defaultValue = "/oh") String path, HttpServletRequest request) throws RepositoryException {
        Session session = getSession(request);
        try {
            path = getAdjustedPath(session, path);
            Node node = session.getNode(path);
            Map<String, String> propertiesMap = new HashMap<>();
            PropertyIterator properties = node.getProperties();
            while (properties.hasNext()) {
                Property property = properties.nextProperty();
                if (!property.getDefinition().isMultiple()) {
                    propertiesMap.put(property.getName(), property.getString());
                } else {
                    propertiesMap.put(property.getName(), "[Multiple Values]");
                }
            }
            return propertiesMap;
        } finally {
            session.logout();
        }
    }

    @PostMapping("/nodes")
    public void addNode(@RequestParam(defaultValue = "/oh") String parentPath, @RequestParam String nodeName, HttpServletRequest request) throws RepositoryException {
        Session session = getSession(request);
        try {
            parentPath = getAdjustedPath(session, parentPath);
            Node parentNode = session.getNode(parentPath);
            parentNode.addNode(nodeName);
            session.save();
        } finally {
            session.logout();
        }
    }

    @DeleteMapping("/nodes")
    public void deleteNode(@RequestParam String path, HttpServletRequest request) throws RepositoryException {
        Session session = getSession(request);
        try {
            path = getAdjustedPath(session, path);
            if ("/oh".equals(path)) {
                return; // Cannot delete the root oh node
            }
            Node node = session.getNode(path);
            node.remove();
            session.save();
        } finally {
            session.logout();
        }
    }

    @PostMapping("/properties")
    public void setProperty(@RequestParam(defaultValue = "/oh") String path, @RequestParam String name, @RequestParam String value, HttpServletRequest request) throws RepositoryException {
        Session session = getSession(request);
        try {
            path = getAdjustedPath(session, path);
            Node node = session.getNode(path);
            node.setProperty(name, value);
            session.save();
        } finally {
            session.logout();
        }
    }

    @DeleteMapping("/properties")
    public void deleteProperty(@RequestParam(defaultValue = "/oh") String path, @RequestParam String name, HttpServletRequest request) throws RepositoryException {
        Session session = getSession(request);
        try {
            path = getAdjustedPath(session, path);
            Node node = session.getNode(path);
            if (node.hasProperty(name)) {
                node.getProperty(name).remove();
                session.save();
            }
        } finally {
            session.logout();
        }
    }

    private void ensureOhNode(Session session) throws RepositoryException {
        Node root = session.getRootNode();
        if (!root.hasNode("oh")) {
            root.addNode("oh");
            session.save();
        }
    }

    private String getAdjustedPath(Session session, String path) throws RepositoryException {
        ensureOhNode(session);
        if ("/".equals(path)) {
            return "/oh";
        } else if (!path.startsWith("/oh")) {
            return "/oh" + (path.startsWith("/") ? "" : "/") + path;
        }
        return path;
    }

    @ExceptionHandler(RepositoryException.class)
    public ResponseEntity<String> handleRepositoryException(RepositoryException e) {
        if ("Unauthorized".equals(e.getMessage())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }
}
