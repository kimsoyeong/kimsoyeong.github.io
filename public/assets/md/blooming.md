# Blooming : Image Style Transfer Website

---

**'Blooming 🌼'** is a *website to change the image style to the style you want*.

Given one content image and one style image, we ***create a new, target image which should contain our desired content and style components***.

An example is shown below, where the content image is of a woman, and the style image is of Starry night. The generated target image still contains the woman but is stylized with the colors and textures of the style image.
![example](https://user-images.githubusercontent.com/44187125/105284787-82d4d200-5bf6-11eb-9b5e-51e74c648f91.JPG)
![GIF 2021-02-03 오후 4-49-34](https://user-images.githubusercontent.com/50094131/106714913-d6f0a500-663f-11eb-9637-f1baab736498.gif)


## Features

### Transfer 🎨

- Image style transfer

### Album 🖼️

- Gallery for results
- Search photo



## Tech Stack

|                                                                                                                                                                                                   Frontend                                                                                                                                                                                                   |                                                                                                                                            Backend                                                                                                                                            |                                                                                                                                                                                                                                   etc                                                                                                                                                                                                                                   |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| ![react](https://img.shields.io/badge/react-v16.14.0-9cf?logo=react) ![Javascript](https://img.shields.io/badge/javascript-ES6+-yellow?logo=javascript) ![Bootstrap](https://img.shields.io/badge/bootstrap-v1.4.3-9cf?logo=bootstrap) ![axios](https://img.shields.io/badge/axios-v0.21.1-9cf?color=purple) ![Styled-components](https://img.shields.io/badge/styled_components-v5.2.1-DB7093?logo=styled-components) | ![Flask](https://img.shields.io/badge/flask-v1.1.2-green?logo=flask) ![Python](https://img.shields.io/badge/python-v3.8.6-skyblue?logo=python) ![Gunicorn](https://img.shields.io/badge/gunicorn-v20.0.4-darkgreen?logo=gunicorn) ![MySQL](https://img.shields.io/badge/mysql-v4.2.11-blue?logo=mysql) | ![Docker](https://img.shields.io/badge/docker-v20.10.2-blue?logo=docker) ![Nginx](https://img.shields.io/badge/Nginx-v1.14.0-brightgreen?logo=nginx) ![github](https://img.shields.io/badge/github-gray?logo=github) ![VScode](https://img.shields.io/badge/VScode-v1.52.1-blue?logo=visual-studio-code) ![Google Cloud Platform](https://img.shields.io/badge/Google_Cloud_Platform-VM_instance-red?logo=gcp) ![AWS](https://img.shields.io/badge/AWS-EC2_instance-orange?logo=aws) |

### Used Model

[Image Style Transfer model](https://github.com/magenta/magenta/tree/master/magenta/models/arbitrary_image_stylization) from Tensorflow-hub


## System Architecture

![시스템아키텍쳐-최종](https://user-images.githubusercontent.com/44187125/106837480-e9b9b700-66dd-11eb-91c8-498850709e1a.png)
