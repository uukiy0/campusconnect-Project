# CampusConnect

CampusConnect is a cloud-based campus event booking application developed for a university cloud computing project.

The application uses a microservice architecture and is deployed using Microsoft Azure.

## Features

- User registration and login
- Browse campus events
- View event details
- Book events
- View personal bookings
- Admin event creation
- Upload event images
- Serverless booking confirmation

## Pages

1. Home
2. Events
3. Event Details
4. My Bookings
5. Admin / Create Event
6. Login / Register

## Architecture


Browser -> React + Nginx Frontend -> Auth Service
          Azure Container Apps            
                                  -> Event Service ----> Azure Blob Storage
   
                                  -> Booking Service --> Azure Function
   
                                  ---------------------> Azure Cosmos DB



The frontend and backend services run as separate Docker containers.

The frontend is publicly accessible, while the backend services communicate internally through Azure Container Apps.

## Technologies

### Frontend

- React
- Vite
- Nginx

### Backend

- Node.js
- Express
- REST API
- JWT authentication

### Cloud

- Microsoft Azure
- Azure Container Apps
- Azure Container Registry
- Azure Cosmos DB
- Azure Blob Storage
- Azure Functions

### Containers

- Docker
- Docker Compose

## Microservices

### Auth Service

Handles user registration, login and authentication.

Endpoints:


POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me


### Event Service

Handles events and uploaded event images.

Endpoints:


GET  /api/events
GET  /api/events/:id
POST /api/events
GET  /api/events/images/:name


Event images are stored in Azure Blob Storage.

### Booking Service

Handles event bookings.

Endpoints:


POST /api/bookings
GET  /api/bookings/my


The Booking Service communicates with the Event Service and calls an Azure Function after a booking is created.

## Database

The application uses Azure Cosmos DB for NoSQL.

Database: 
campusbooking


Containers:
users
events
bookings


## Blob Storage

Uploaded event images are stored in the private Azure Blob Storage container:


event-images


## Serverless Component

An Azure Function is used as the serverless component.

It is called after a successful booking and generates a booking confirmation.

The function is located in:


serverless/confirmation-function


## Container Deployment

The project contains four Docker containers:


campus-frontend
auth-service
event-service
booking-service


The Docker images are stored in Azure Container Registry and deployed using Azure Container Apps.

Azure Container Apps provides the container orchestration and cloud hosting for the application.

## Run Locally

Requirements:

- Docker Desktop
- Docker Compose

Create the environment file:

bash:

cp .env.example .env


Start the application:

bash:
docker compose up --build


Open:


http://localhost:8080


## Environment Variables

The application uses environment variables such as:


JWT_SECRET
ADMIN_EMAIL
COSMOS_ENDPOINT
COSMOS_KEY
COSMOS_DATABASE
AZURE_STORAGE_CONNECTION_STRING
AZURE_STORAGE_CONTAINER
EVENT_SERVICE_URL
CONFIRMATION_FUNCTION_URL


Real credentials and secrets are not stored in the repository.


## Cloud Computing Concepts

The project demonstrates:

- Full-stack web development
- Microservice architecture
- REST APIs
- Docker containerization
- Container orchestration with Azure Container Apps
- Cloud hosting
- Cloud database storage with Azure Cosmos DB
- Cloud image storage with Azure Blob Storage
- Serverless computing with Azure Functions

## Hosted Application

The application is deployed on Microsoft Azure using Azure Container Apps.


https://campus-frontend.whitegrass-39448f63.swedencentral.azurecontainerapps.io/


## Security

Secrets, passwords, database keys and connection strings are not committed to GitHub.

Sensitive configuration is stored using environment variables and Azure Container Apps secrets.
