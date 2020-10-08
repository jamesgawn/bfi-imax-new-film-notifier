variable "profile" {
  type = string
  default = "default"
}

variable "region" {
  type = string
  default = "eu-west-2"
}

variable "twitter_consumer_key" {
  type = string
}

variable "twitter_consumer_secret" {
  type = string
}

variable "twitter_access_token_key" {
  type = string
}

variable "twitter_access_token_secret" {
  type = string
}

variable "twitter_enabled" {
  type = bool
  default = false
}

variable "film_look_forward_days" {
  type = number
  default = 30
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

  environment {
    variables = {
      twitter_enabled = var.twitter_enabled
      twitter_consumer_key = var.twitter_consumer_key
      twitter_consumer_secret = var.twitter_consumer_secret
      twitter_access_token_key = var.twitter_access_token_key
      twitter_access_token_secret = var.twitter_access_token_secret
      film_look_forward_days = var.film_look_forward_days
    }
  }

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

resource "aws_iam_policy" "bfi_film_dynamodb_table_policy" {
  name = "bfi_film_lambda_policy"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Effect": "Allow",
          "Action": [
              "dynamodb:PutItem",
              "dynamodb:GetItem",
              "dynamodb:UpdateItem"
          ],
          "Resource": "arn:aws:dynamodb:*:*:table/bfi-film-showings"
      }
  ]
}
  EOF
}

resource "aws_iam_role_policy_attachment" "lambda_execution_dynamodb_access_attachment" {
  policy_arn = aws_iam_policy.bfi_film_dynamodb_table_policy.arn
  role = aws_iam_role.lambda_execution_role.name
}

resource "aws_dynamodb_table" "film_showing_records" {
  name = "bfi-film-showings"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "id"

  attribute {
    name = "id"
    type = "S"
  }
}
