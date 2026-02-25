package adatkeret;

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
    public List<Map<String, Object>> getNodes(@RequestParam(defaultValue = "/") String path) throws RepositoryException {
        Session session = repository.login(new SimpleCredentials("admin", "admin".toCharArray()));
        try {
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
    public Map<String, String> getProperties(@RequestParam String path) throws RepositoryException {
        Session session = repository.login(new SimpleCredentials("admin", "admin".toCharArray()));
        try {
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
}
