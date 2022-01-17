# GEOREFERENCED FILE SERVER 
## Hosted on AWS

---

## Setup AWS Elements
### S3 Bucket:
Setup a basic S3 bucket with default values
### IAM Policy:
Use the JSON object below (replacing the bucket name with your s3 bucket's name):

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::s3bucketName/*"
        }
    ]
}
```

### IAM User:
Setup an IAM User with programmtic access, add the custom IAM policicy to it, and retrieve the Access Key ID and the Secret Access Key ID.

---

### Store the Region, S3 Bucket Name, Access Key ID, and Secret Access Key Id in a .env file

---