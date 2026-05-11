from django.contrib import admin
from .models import User, Assessment, FollowUp, Appointment

admin.site.register(User)
admin.site.register(Assessment)
admin.site.register(FollowUp)
admin.site.register(Appointment)
