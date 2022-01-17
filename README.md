# GEOREFERENCED FILE SERVER 
## Hosted on AWS

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

# Python Dependencies:
* pandas
* gdal

### Installing GDAL on Linux:
```
#!/usr/bin/env bash

sudo add-apt-repository ppa:ubuntugis/ppa && sudo apt-get update
sudo apt-get update
sudo apt-get install gdal-bin
sudo apt-get install libgdal-dev
export CPLUS_INCLUDE_PATH=/usr/include/gdal
export C_INCLUDE_PATH=/usr/include/gdal
pip install GDAL
```
---

# Current API:

### Upload to S3:
`localhost:8080/upload/`
POST Request with form containing geo_file:path-to-file

### Download from S3:
`localhost:8080/download/:key`
GET Request where key=filename of object to download

### Generate Cut/Fill Report"
`localhost:8080/cut-fill/:topo/:base`
POST Request where topo=filename of object to measure and base=filename of object to measure against

### Get EPSG Code from file:
`localhost:8080/epsg/:tif`
POST request where tif=filename of object to analyze

---