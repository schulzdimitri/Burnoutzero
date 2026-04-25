from django.db import models


class HealthCheck(models.Model):
    checked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "core"
