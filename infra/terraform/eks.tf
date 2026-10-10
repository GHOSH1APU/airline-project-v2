module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "airline-prod-eks"
  cluster_version = "1.37"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  # Secure Pod-level AWS access
  enable_irsa                              = true
  enable_cluster_creator_admin_permissions = true

  # Ensures networking plugins match the 1.37 control plane
  cluster_addons = {
    coredns    = { most_recent = true }
    kube-proxy = { most_recent = true }
    vpc-cni    = { most_recent = true }
  }

  eks_managed_node_groups = {
    main = {
      min_size     = 1
      max_size     = 4
      desired_size = 3

      instance_types = ["t3.medium"]
      capacity_type  = "SPOT"
      ami_type       = "AL2023_x86_64_STANDARD"
    }
  }
}
