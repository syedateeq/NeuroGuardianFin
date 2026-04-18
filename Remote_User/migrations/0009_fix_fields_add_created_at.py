"""
Fix model fields:
- Increase field lengths on ClientRegister_Model (password, email, username, etc.)
- Add null/blank=True to optional fields
- Add created_at to stroke_risk_prediction_type
"""

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('Remote_User', '0008_detection_accuracy_detection_ratio_and_more'),
    ]

    operations = [
        # ── ClientRegister_Model fixes ──────────────────────────────────────
        migrations.AlterField(
            model_name='clientregister_model',
            name='username',
            field=models.CharField(max_length=150),
        ),
        migrations.AlterField(
            model_name='clientregister_model',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AlterField(
            model_name='clientregister_model',
            name='password',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='clientregister_model',
            name='phoneno',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='clientregister_model',
            name='country',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='clientregister_model',
            name='state',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='clientregister_model',
            name='city',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='clientregister_model',
            name='address',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AlterField(
            model_name='clientregister_model',
            name='gender',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),

        # ── stroke_risk_prediction_type fixes ──────────────────────────────
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='idn',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='gender',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='age',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='hypertension',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='heart_disease',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='ever_married',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='work_type',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='Residence_type',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='avg_glucose_level',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='bmi',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='smoking_status',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='stroke_risk_prediction_type',
            name='Prediction',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AddField(
            model_name='stroke_risk_prediction_type',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
