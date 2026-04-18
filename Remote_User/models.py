from django.db import models

# Create your models here.
from django.db.models import CASCADE


class ClientRegister_Model(models.Model):
    username = models.CharField(max_length=150)
    email = models.EmailField(max_length=254, blank=True, null=True)
    password = models.CharField(max_length=255)  # store hashed or plain; increased length
    phoneno = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=500, blank=True, null=True)
    gender = models.CharField(max_length=30, blank=True, null=True)
    # Firebase Storage image URL
    profile_image = models.URLField(max_length=2000, blank=True, null=True)


class stroke_risk_prediction_type(models.Model):

    idn = models.CharField(max_length=300, blank=True, null=True)
    gender = models.CharField(max_length=300, blank=True, null=True)
    age = models.CharField(max_length=300, blank=True, null=True)
    hypertension = models.CharField(max_length=300, blank=True, null=True)
    heart_disease = models.CharField(max_length=300, blank=True, null=True)
    ever_married = models.CharField(max_length=300, blank=True, null=True)
    work_type = models.CharField(max_length=300, blank=True, null=True)
    Residence_type = models.CharField(max_length=300, blank=True, null=True)
    avg_glucose_level = models.CharField(max_length=300, blank=True, null=True)
    bmi = models.CharField(max_length=300, blank=True, null=True)
    smoking_status = models.CharField(max_length=300, blank=True, null=True)
    Prediction = models.CharField(max_length=300, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)


class detection_accuracy(models.Model):

    names = models.CharField(max_length=300)
    ratio = models.CharField(max_length=300)

class detection_ratio(models.Model):

    names = models.CharField(max_length=300)
    ratio = models.CharField(max_length=300)



