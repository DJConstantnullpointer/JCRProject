package hu.educatio.jcr;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.jcr.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class JcrController {

    @Autowired
    private Repository repository;

    @GetMapping("/nodes")
    public List<Map<String, Object>> getNodes(@RequestParam(defaultValue = "/oh") String path) throws RepositoryException {
        Session session = repository.login(new SimpleCredentials("admin", "admin".toCharArray()));
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
    public Map<String, String> getProperties(@RequestParam(defaultValue = "/oh") String path) throws RepositoryException {
        Session session = repository.login(new SimpleCredentials("admin", "admin".toCharArray()));
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
    public void addNode(@RequestParam(defaultValue = "/oh") String parentPath, @RequestParam String nodeName) throws RepositoryException {
        Session session = repository.login(new SimpleCredentials("admin", "admin".toCharArray()));
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
    public void deleteNode(@RequestParam String path) throws RepositoryException {
        Session session = repository.login(new SimpleCredentials("admin", "admin".toCharArray()));
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
    public void setProperty(@RequestParam(defaultValue = "/oh") String path, @RequestParam String name, @RequestParam String value) throws RepositoryException {
        Session session = repository.login(new SimpleCredentials("admin", "admin".toCharArray()));
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
    public void deleteProperty(@RequestParam(defaultValue = "/oh") String path, @RequestParam String name) throws RepositoryException {
        Session session = repository.login(new SimpleCredentials("admin", "admin".toCharArray()));
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
}
