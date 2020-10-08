variable "profile" {
  type = string
  default = "default"
}

variable "region" {
  type = string
  default = "eu-west-2"
}

provider "aws" {
  region = var.region
  profile = var.profile
}

terraform {
  backend "s3" {
    bucket = "ana-terraform-state-prod"
    key = "bfi-imax-new-film-notifier/terraform.tfstate"
    region = "eu-west-2"
  }
}

data "archive_file" "lambda_code" {
  type        = "zip"
  output_path = "${path.module}/dist-lambda.zip"
  source_dir = "${path.module}/dist"
}

resource "aws_lambda_function" "lambda" {
  function_name = "bfi-imax-new-film-notifier"

  handler = "lambda.handler"
  runtime = "nodejs12.x"
  filename = "dist-lambda.zip"
  source_code_hash = data.archive_file.lambda_code.output_sha

  role = aws_iam_role.lambda_execution_role.arn
}

resource "aws_iam_role" "lambda_execution_role" {
  name = "bfi_imax_new_film_notifier_execution_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_execution_basis_role_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role = aws_iam_role.lambda_execution_role.name
}
