from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from api.models import Avaliacao, Insight

User = get_user_model()


class ApiViewsTestCase(APITestCase):
    def setUp(self):
        self.funcionario = User.objects.create_user(
            username='func', password='password', role='funcionario', departamento='TI'
        )
        self.gestor = User.objects.create_user(
            username='gestor', password='password', role='gestor', departamento='TI'
        )
        self.psicologo = User.objects.create_user(
            username='psico', password='password', role='psicologo', departamento='Saude'
        )

    def test_avaliacao_create_and_gamificacao(self):
        self.client.force_authenticate(user=self.funcionario)
        data = {
            'estresse': 60,
            'ansiedade': 20,
            'burnout': 10,
            'depressao': 5,
        }
        # Cobre AvaliacaoViewSet e _gerar_insight
        response = self.client.post(reverse('avaliacao-list'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Cobre minha_pontuacao
        response2 = self.client.get(reverse('minha_pontuacao'))
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.data['total_pontos'], 10)

        # Cobre InsightViewSet (funcionario)
        response3 = self.client.get(reverse('insight-list'))
        self.assertEqual(response3.status_code, status.HTTP_200_OK)

    def test_team_overview(self):
        self.client.force_authenticate(user=self.gestor)
        response = self.client.get(reverse('team_overview'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Test access denial
        self.client.force_authenticate(user=self.funcionario)
        response2 = self.client.get(reverse('team_overview'))
        self.assertEqual(response2.status_code, status.HTTP_403_FORBIDDEN)

    def test_acompanhamento_and_insight_psicologo(self):
        # Setup insight para testar a rota validar_insight
        avaliacao = Avaliacao.objects.create(
            funcionario=self.funcionario, nivel_risco='alto')
        insight = Insight.objects.create(
            funcionario=self.funcionario, avaliacao=avaliacao, texto="T", recomendacoes="R")

        self.client.force_authenticate(user=self.psicologo)
        response = self.client.patch(reverse('validar_insight', args=[insight.id]), {
            'texto': 'Novo texto'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response2 = self.client.get(reverse('insight-list'))
        self.assertEqual(response2.status_code, status.HTTP_200_OK)

        # Cobre Acompanhamento
        response3 = self.client.post(reverse('acompanhamento-list'), {
            'funcionario': self.funcionario.id,
            'status': 'ativo',
            'anotacoes_privadas': 'Anotações'
        })
        self.assertEqual(response3.status_code, status.HTTP_201_CREATED)

    def test_agendamento(self):
        self.client.force_authenticate(user=self.funcionario)
        response = self.client.post(reverse('agendamento-list'), {
            'nome_psicologo': 'Dra. Ana',
            'data_hora': '10:00'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
