from django.test import TestCase, Client
from django.urls import reverse


class HealthCheckViewTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_check_returns_200(self):
        response = self.client.get(reverse("health-check"))
        self.assertEqual(response.status_code, 200)

    def test_health_check_returns_ok_status(self):
        response = self.client.get(reverse("health-check"))
        data = response.json()
        self.assertEqual(data["status"], "ok")

    def test_health_check_content_type_is_json(self):
        response = self.client.get(reverse("health-check"))
        self.assertEqual(response["Content-Type"], "application/json")
