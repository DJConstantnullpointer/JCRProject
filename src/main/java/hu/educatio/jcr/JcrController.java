package hu.educatio.jcr;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
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

    private static final String ACCESS_PROPERTY = "access";
    private static final String ADMIN_USER = "admin";

    private enum AuthLevel {
        VIEW(1), ADD(2), EDIT(3), ALL(4);
        private final int rank;
        AuthLevel(int rank) { this.rank = rank; }
        public boolean atLeast(AuthLevel other) { return this.rank >= other.rank; }
    }

    private Session getSession(HttpServletRequest request) throws RepositoryException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Basic ")) {
            String base64Credentials = authHeader.substring("Basic ".length()).trim();
            byte[] credDecoded = Base64.getDecoder().decode(base64Credentials);
            String credentials = new String(credDecoded, StandardCharsets.UTF_8);
            // credentials = username:password
            final String[] values = credentials.split(":", 2);
            if (values.length == 2) {
                if (ADMIN_USER.equals(values[0])) {
                    return repository.login(new SimpleCredentials(values[0], values[1].toCharArray()));
                } else {
                    return repository.login(new SimpleCredentials(ADMIN_USER, ADMIN_USER.toCharArray()));
                }
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

    private String getUsername(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Basic ")) {
            String base64Credentials = authHeader.substring("Basic ".length()).trim();
            byte[] credDecoded = Base64.getDecoder().decode(base64Credentials);
            String credentials = new String(credDecoded, StandardCharsets.UTF_8);
            final String[] values = credentials.split(":", 2);
            if (values.length == 2) {
                return values[0];
            }
        }
        return null;
    }

    private boolean hasAccess(Node node, String username, AuthLevel required) throws RepositoryException {
        if (ADMIN_USER.equals(username)) {
            return true;
        }
        
        // Special rule for /oh root: all users have view access
        if ("/oh".equals(node.getPath()) && required == AuthLevel.VIEW) {
            return true;
        }

        if (!node.hasProperty(ACCESS_PROPERTY)) {
            return false;
        }

        String accessValue = node.getProperty(ACCESS_PROPERTY).getString();
        // format: username:authorization;username:authorization;...
        String[] parts = accessValue.split(";");
        for (String part : parts) {
            String[] userAuth = part.split(":");
            if (userAuth.length == 2 && userAuth[0].equals(username)) {
                try {
                    AuthLevel userLevel = AuthLevel.valueOf(userAuth[1].toUpperCase());
                    if (userLevel.atLeast(required)) {
                        return true;
                    }
                } catch (IllegalArgumentException e) {
                    // Ignore invalid auth levels
                }
            }
        }

        return false;
    }

    @GetMapping("/nodes")
    public List<Map<String, Object>> getNodes(@RequestParam(defaultValue = "/oh") String path, HttpServletRequest request) throws RepositoryException {
        Session session = getSession(request);
        String username = getUsername(request);
        try {
            path = getAdjustedPath(session, path);
            Node node = session.getNode(path);
            
            if (!hasAccess(node, username, AuthLevel.VIEW)) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> result = new ArrayList<>();
            NodeIterator nodes = node.getNodes();
            while (nodes.hasNext()) {
                Node child = nodes.nextNode();
                if (hasAccess(child, username, AuthLevel.VIEW)) {
                    Map<String, Object> nodeMap = new HashMap<>();
                    nodeMap.put("name", child.getName());
                    nodeMap.put("path", child.getPath());
                    nodeMap.put("hasNodes", child.hasNodes());
                    result.add(nodeMap);
                }
            }
            return result;
        } finally {
            session.logout();
        }
    }

    @GetMapping("/properties")
    public Map<String, String> getProperties(@RequestParam(defaultValue = "/oh") String path, HttpServletRequest request) throws RepositoryException {
        Session session = getSession(request);
        String username = getUsername(request);
        try {
            path = getAdjustedPath(session, path);
            Node node = session.getNode(path);

            if (!hasAccess(node, username, AuthLevel.VIEW)) {
                return Collections.emptyMap();
            }

            return getPropertiesMap(node);
        } finally {
            session.logout();
        }
    }

    @NonNull
    private static Map<String, String> getPropertiesMap(Node node) throws RepositoryException {
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
    }

    @PostMapping("/nodes")
    public void addNode(@RequestParam(defaultValue = "/oh") String parentPath, @RequestParam String nodeName, HttpServletRequest request) throws RepositoryException {
        Session session = getSession(request);
        String username = getUsername(request);
        try {
            if (!ADMIN_USER.equals(username)) {
                throw new RepositoryException("Unauthorized: only admin can add nodes");
            }

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
        String username = getUsername(request);
        try {
            path = getAdjustedPath(session, path);
            if ("/oh".equals(path)) {
                return; // Cannot delete the root oh node
            }
            Node node = session.getNode(path);
            
            if (!hasAccess(node, username, AuthLevel.ALL)) {
                throw new RepositoryException("Unauthorized");
            }

            node.remove();
            session.save();
        } finally {
            session.logout();
        }
    }

    @PostMapping("/properties")
    public void setProperty(@RequestParam(defaultValue = "/oh") String path, @RequestParam String name, @RequestParam String value, HttpServletRequest request) throws RepositoryException {
        Session session = getSession(request);
        String username = getUsername(request);
        try {
            path = getAdjustedPath(session, path);
            Node node = session.getNode(path);
            
            if ("/oh".equals(path) && !ADMIN_USER.equals(username)) {
                throw new RepositoryException("Unauthorized: only admin can edit /oh root");
            }

            AuthLevel required = node.hasProperty(name) ? AuthLevel.EDIT : AuthLevel.ADD;
            if (!hasAccess(node, username, required)) {
                throw new RepositoryException("Unauthorized");
            }

            node.setProperty(name, value);
            session.save();
        } finally {
            session.logout();
        }
    }

    @DeleteMapping("/properties")
    public void deleteProperty(@RequestParam(defaultValue = "/oh") String path, @RequestParam String name, HttpServletRequest request) throws RepositoryException {
        Session session = getSession(request);
        String username = getUsername(request);
        try {
            path = getAdjustedPath(session, path);
            Node node = session.getNode(path);

            if ("/oh".equals(path) && !ADMIN_USER.equals(username)) {
                throw new RepositoryException("Unauthorized: only admin can edit /oh root");
            }

            if (!hasAccess(node, username, AuthLevel.ALL)) {
                throw new RepositoryException("Unauthorized");
            }

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
        if ("Unauthorized".equals(e.getMessage()) || (e.getMessage() != null && e.getMessage().startsWith("Unauthorized:"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }
}
