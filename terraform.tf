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

variable "dry_run" {
  type = bool
  default = false
  description = "Is automatic posting to twitter enabled?"
}

variable "film_look_forward_days" {
  type = number
  default = 7
  description = "The number of days ahead to look for new films"
}

variable "frequency" {
  type = number
  default = 15
  description = "The frequency in minutes by which to check for new films."
}

variable "notification_sns_queue_name" {
  type = string
  description = "The name of the SNS queue to send ok/error alarms if the lambda stops working."
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
  description = "A lambda function to check if there are any new films available for booking at the BFI imax"

  handler = "lambda.handler"
  runtime = "nodejs12.x"
  filename = data.archive_file.lambda_code.output_path
  source_code_hash = filebase64sha256(data.archive_file.lambda_code.output_path)
  memory_size = 192
  timeout = 10

  environment {
    variables = {
      dry_run = var.dry_run
      twitter_consumer_key = var.twitter_consumer_key
      twitter_consumer_secret = var.twitter_consumer_secret
      twitter_access_token_key = var.twitter_access_token_key
      twitter_access_token_secret = var.twitter_access_token_secret
      film_look_forward_days = var.film_look_forward_days
      dynamodb_table_name = aws_dynamodb_table.film_showing_records.name
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

resource "aws_cloudwatch_event_rule" "scheduled_event_rule" {
  name = "bfi-imax-new-film-notifier-trigger-rule"
  schedule_expression = "rate(${var.frequency} minutes)"
  description = "A rule to regularly trigger the bfi imax new film notifier lambda."
}

resource "aws_cloudwatch_event_target" "scheduled_event_target" {
  arn = aws_lambda_function.lambda.arn
  rule = aws_cloudwatch_event_rule.scheduled_event_rule.name
}

resource "aws_lambda_permission" "allow_clowdwatch_to_trigger_lambda" {
  statement_id = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.arn
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.scheduled_event_rule.arn
}

data "aws_sns_topic" "notification_alerts" {
  name = var.notification_sns_queue_name
}

resource "aws_cloudwatch_metric_alarm" "monitoring_alarm" {
  alarm_name = "bfi-imax-new-film-notifier-error-check"
  alarm_description = "BFI IMAX New Film Notifier Checkers"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods = 2
  namespace = "AWS/Lambda"
  metric_name = "Errors"
  statistic = "Sum"
  period = 900
  threshold = 1
  treat_missing_data = "notBreaching"
  alarm_actions = [data.aws_sns_topic.notification_alerts.arn]
  ok_actions = [data.aws_sns_topic.notification_alerts.arn]
  dimensions = {
    FunctionName = aws_lambda_function.lambda.function_name
  }
}
