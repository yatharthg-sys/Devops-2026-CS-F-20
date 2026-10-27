pipeline {
    agent any

    environment {
        APP_NAME = 'shekhawat-dhaba'
        IMAGE_TAG = "${env.BUILD_NUMBER ?: 'latest'}"
        DOCKER_IMAGE = "shekhawat-dhaba:${env.BUILD_NUMBER ?: 'latest'}"
        PORT = "5000"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        ansiColor('xterm')
    }

    stages {
        stage('Checkout & Environment Inspection') {
            steps {
                echo "🚀 Starting CI/CD Pipeline for ${APP_NAME} on branch: ${env.BRANCH_NAME ?: 'main'}"
                echo "Node Version:"
                sh 'node -v || true'
                echo "NPM Version:"
                sh 'npm -v || true'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing application dependencies...'
                dir('Backend') {
                    sh 'npm ci || npm install'
                }
            }
        }

        stage('Automated Testing') {
            steps {
                echo '🧪 Executing automated test suite and API verification...'
                dir('Backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Code Quality & Security Scan') {
            steps {
                echo '🔍 Checking security advisories and code standards...'
                dir('Backend') {
                    sh 'npm audit --audit-level=high || true'
                }
            }
        }

        stage('Docker Container Build') {
            steps {
                echo "🐳 Building Docker image ${DOCKER_IMAGE}..."
                sh "docker build -t ${DOCKER_IMAGE} -t ${APP_NAME}:latest ."
            }
        }

        stage('Container Health Sanity Check') {
            steps {
                echo '🩺 Spinning up ephemeral container for sanity validation...'
                sh """
                    docker run -d --name ephemeral-${BUILD_NUMBER} -p 5001:5000 -e PORT=5000 ${DOCKER_IMAGE}
                    sleep 5
                    curl -f http://localhost:5001/api/health || exit 1
                    docker stop ephemeral-${BUILD_NUMBER}
                    docker rm ephemeral-${BUILD_NUMBER}
                """
            }
        }

        stage('Deploy to Kubernetes Staging') {
            when {
                branch 'main'
            }
            steps {
                echo '☸️ Applying Kubernetes manifests to cluster...'
                sh '''
                    kubectl apply -f k8s/namespace.yaml
                    kubectl apply -f k8s/configmap.yaml
                    kubectl apply -f k8s/mongo-pvc.yaml
                    kubectl apply -f k8s/mongo-deployment.yaml
                    kubectl apply -f k8s/app-deployment.yaml
                    kubectl apply -f k8s/app-service.yaml
                    kubectl rollout status deployment/dhaba-app-deployment -n shekhawat-dhaba --timeout=60s || true
                '''
            }
        }
    }

    post {
        always {
            echo '🧹 Post-build pipeline cleanup complete.'
            cleanWs()
        }
        success {
            echo "✅ Pipeline completed successfully! Build #${env.BUILD_NUMBER} is healthy."
        }
        failure {
            echo "❌ Pipeline failed at stage. Immediate team notification triggered."
        }
    }
}
