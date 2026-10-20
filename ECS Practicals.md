## **Phase 1: Package and Run the Application Locally with Docker**

Before moving anything to AWS, you need to containerize your application using Docker so it runs identically in any environment.

**1.Verify Your Monolithic Application Locally:**Prerequisite.  
Ensure your application server runs correctly on your host machine. For a Node.js app, start the application and test your endpoints.

*Verification:* The console outputs a confirmation message like server is ready and responds properly to local HTTP queries on port 3000\.

**2.Write or Inspect the Dockerfile:**Container Configuration.  
Create a Dockerfile in your project root. It should use a base image with your required runtime (such as Node.js), copy your application files into the container, install dependencies using npm install, and expose the required port.

**3.Build the Docker Container Image:**Docker Build.  
Run the build command in your terminal pointing to your Dockerfile directory:

Bash  
docker build \-t my-monolith-app .

*Verification:* Docker finishes building layers successfully and tags the image as my-monolith-app.

**4.Run and Test the Container Locally:**Local Verification.  
Run the container in detached mode and map your local port 3000 to the container port:

Bash  
docker run \-d \-p 3000:3000 my-monolith-app  
docker run \-d \--name form-api \-p 3000:3000 my-monolith-app

Clean-Up  
docker stop  
docker rm  
*Verification:* Open your browser or use curl to hit http\://localhost:3000 and confirm your API routes return the expected JSON responses.

## **Phase 2: Push the Image to Amazon ECR (Elastic Container Registry)**

To run your container in the AWS cloud, you need a centralized private repository to store your image snapshots.

> **1.Create an ECR Repository:**AWS Console.

> 1. Open the Amazon ECR console.  
> 2. Click **Create repository**, name your repository (e.g., monolith-app), and click create.  
>    *Verification:* The repository appears in the list with a success message, providing a list of integration commands.

**2.Authenticate Your Docker Client to ECR:**CLI Login.  
Run the AWS CLI login command in your terminal to allow your local machine to push images to your AWS account:

Bash  
aws ecr get-login-password \--region \<your-region\> | docker login \--username AWS \--password-stdin \<your-account-id\>.dkr.ecr.\<your-region\>.amazonaws.com

*Verification:* The terminal returns Login Succeeded.

**3.Tag and Push Your Docker Image:**Upload to AWS.  
Tag your local container image with your ECR repository URI and push it:

Bash  
docker tag my-monolith-app:latest \<your-ecr-repo-uri\>:latest  
docker push \<your-ecr-repo-uri\>:latest

*Verification:* The layers upload completely and the image status shows as stored in your ECR console.

## **Phase 3: Set Up Infrastructure and Create an ECS Task Definition**

An ECS **task definition** acts as a blueprint or "recipe" telling Amazon ECS how to run your container, how much CPU and memory to allocate, and which ports to open.

**1.Launch the Base Infrastructure Stack:**CloudFormation.  
Deploy a prepared CloudFormation template to set up a fresh Virtual Private Cloud (VPC), a cluster of Docker container hosts, and an Application Load Balancer (ALB).

*Verification:* The CloudFormation stack reaches CREATE\_COMPLETE status in the AWS Console.

> **2.Create the Task Definition in ECS:**Configuration Blueprint.

> 1. Open the Amazon ECS console and click **Create new Task Definition**.  
> 2. Select the configuration method (you can use the console wizard or paste a JSON configuration directly).  
> 3. Enter a task definition name (e.g., monolith-task).  
> 4. Click **Add container**, give it a name, paste your ECR image URL, and define resource allocations (recommended minimum: 256–300 MB memory).  
> 5. Specify your container port (e.g., 3000\) and click **Create**.  
>    *Verification:* The task definition registers successfully and appears with revision :1.

## **Phase 4: Deploy the Monolith as an ECS Service Behind a Load Balancer**

An ECS **service** ensures a specified number of copies (tasks) of your container run continuously and automatically hooks them up to a load balancer.

> **1.Create the ECS Service:**Service Wizard.

> 1. Select your newly created task definition, click **Actions**, and choose **Create Service**.  
> 2. Select your cluster, set the desired number of tasks to 2 (for redundancy), and proceed to the next step.  
> 3. Choose **Application Load Balancer (ALB)** and select the load balancer created by your CloudFormation stack.  
> 4. Add your container to the load balancer, create a new target group, and configure a listener on port 80 to forward incoming traffic to your container port.  
> 5. Review your settings and click **Create Service**.  
>    *Verification:* After a few minutes, the service tasks turn green, indicating a healthy running state.

**2.Test Your Cloud Application:**Live URL Test.  
Locate the DNS name of your Application Load Balancer inside your CloudFormation outputs and paste it into your browser or test via curl.

*Verification:* The monolithic REST API successfully responds to traffic running live in the cloud.

## **Phase 5: Split the Monolith into Microservices with Zero Downtime**

To transition from a monolith to microservices (e.g., separating routes into users, threads, and posts), you will deploy new microservice containers side-by-side with the monolith and route traffic dynamically using ALB listener rules.

**1.Create Repositories and Build Microservice Images:**ECR Repositories.  
Repeat Phase 2 for each microservice. Create separate ECR repositories (e.g., posts-service), build your microservice Docker images locally, and push them to ECR.

*Verification:* All individual microservice images are stored and viewable in ECR.

**2.Create Task Definitions and Run Microservices:**ECS Deployment.  
Create a unique task definition and launch an ECS service for each individual microservice (following the exact steps in Phase 3 and Phase 4).

*Verification:* All microservices deploy successfully alongside the monolith with running tasks turning green in ECS.

> **3.Configure Path-Based Routing on the Load Balancer:**ALB Listener Rules.

> 1. Navigate to your EC2 Load Balancer settings and select your target listener rules.  
> 2. Set up path-based routing rules (e.g., route /posts\* to the posts microservice target group, /users\* to the users microservice target group).  
> 3. Keep a default fallback rule pointing to your monolith for any unsegmented routes.  
>    *Verification:* Sending test requests to specific sub-paths correctly hits the dedicated microservices.

**4.Scale Down the Monolith with Zero Downtime:**Final Cleanup.  
Once all microservices are handling their respective API routes, update your monolithic ECS service's desired task count from 2 down to 0\.

*Verification:* The monolithic tasks terminate, but all application endpoints remain fully functional and responsive without dropping a single client request.

AWS Cost & Resource Cleanup Reminder

Remember to delete your CloudFormation stacks, ECS services, and ECR repositories when you are finished testing to prevent unexpected AWS charges.