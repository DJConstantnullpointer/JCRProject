# JCRProject

This project is a Spring Boot application that provides a web-based browser for an Apache Jackrabbit JCR (Java Content Repository). It includes a RESTful backend and a React-based frontend to visualize and navigate through the JCR node hierarchy.

## Features

- **JCR Node Browser**: Navigate through nodes in the repository.
- **Property Viewer**: View all properties associated with a selected node.
- **REST API**: Simple API to interact with the JCR repository.

## Technologies Used

### Backend
- **Spring Boot 2.5.4**: Core application framework.
- **Apache Jackrabbit 2.22.3**: JCR implementation.
- **Apache Derby**: Used by Jackrabbit for data storage.
- **Maven**: Dependency management and build tool.

### Frontend
- **React 17.0.2**: Frontend library.
- **TypeScript**: Typed JavaScript for better development experience.
- **Axios**: HTTP client for API requests.

## Getting Started

### Prerequisites
- Java 15 or higher
- Maven 3.6+
- Node.js and npm (for frontend)

### Running the Backend

1. Navigate to the project root directory.
2. Build the project using Maven:
   ```bash
   mvn clean install
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will be available at `http://localhost:8080`.

### Running the Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React application:
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`.

## API Endpoints

The backend provides the following REST endpoints:

- **GET `/api/nodes?path={path}`**: Retrieves a list of child nodes for the specified path. Default path is `/`.
- **GET `/api/properties?path={path}`**: Retrieves all properties for the node at the specified path.

## Project Structure

- `src/main/java/adatkeret/JcrApplication.java`: Main entry point for the Spring Boot application.
- `src/main/java/adatkeret/JcrController.java`: REST controller for JCR operations.
- `src/main/java/adatkeret/Main.java`: Standalone JCR example (demonstrates basic node creation and XML import).
- `frontend/`: Contains the React application.
  - `src/App.tsx`: Main React component.
  - `src/components/Nodes.tsx`: Component for displaying and navigating nodes.
  - `src/components/Properties.tsx`: Component for displaying node properties.
- `pom.xml`: Maven configuration with all dependencies.
- `test.xml`: Sample XML file for JCR import.

## License

This project is for educational purposes.
