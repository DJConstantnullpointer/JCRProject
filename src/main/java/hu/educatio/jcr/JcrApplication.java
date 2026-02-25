package hu.educatio.jcr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.apache.jackrabbit.commons.JcrUtils;
import javax.jcr.Repository;
import javax.jcr.RepositoryException;

@SpringBootApplication
public class JcrApplication {

    public static void main(String[] args) {
        SpringApplication.run(JcrApplication.class, args);
    }

    @Bean
    public Repository repository() throws RepositoryException {
        return JcrUtils.getRepository();
    }
}
