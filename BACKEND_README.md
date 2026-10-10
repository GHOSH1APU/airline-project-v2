# Global Airways - Backend Architecture (EKS & GitOps)

This document outlines the backend architecture, microservices setup, and the GitOps deployment pipeline for the Global Airways platform. The backend is completely containerized and managed via Kubernetes on AWS EKS.

## 🏗️ Architecture Overview

The backend follows a microservices architecture to ensure high availability, scalability, and independent deployment cycles.

* **Infrastructure:** AWS Elastic Kubernetes Service (EKS).
* **Deployment Strategy:** GitOps using **Argo CD**.
* **Traffic Routing:** Kubernetes Ingress (acting as an API Gateway).
* **Namespaces:** logically isolated into `airline-backend-prod`.

### Microservices
1. **Flight Search API (`flight-search-service`)**: Handles flight inventory, scheduling, and search queries (e.g., CCU to DXB).
2. **Booking Management API (`booking-management-service`)**: Handles reservation logic, PNR generation, and booking state.

---

## 🚀 Deployment Guide (GitOps Workflow)

We utilize Argo CD for declarative, version-controlled deployments. Instead of running `kubectl apply` manually, we push our manifests to GitHub, and Argo CD automatically synchronizes the cluster state.

### Step 1: Directory Structure
All Kubernetes manifests are stored in the `k8s/` directory.
```text
airline-platform/
└── k8s/
    ├── backend/
    │   ├── 01-namespace.yaml
    │   ├── 02-flight-search.yaml
    │   ├── 03-booking.yaml
    │   └── 04-ingress.yaml
    └── argocd/
        └── airline-backend-app.yaml
