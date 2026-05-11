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

    def test_insight_logic_levels(self):
        self.client.force_authenticate(user=self.funcionario)
        
        data_low = {'estresse': 5, 'ansiedade': 5, 'burnout': 0, 'depressao': 0}
        self.client.post(reverse('avaliacao-list'), data_low)
        insight_low = Insight.objects.filter(funcionario=self.funcionario).latest('gerado_em')
        self.assertIn("indicadores estão dentro da faixa esperada", insight_low.texto)
        self.assertIn("hábitos saudáveis", insight_low.recomendacoes)

        data_med = {'estresse': 10, 'ansiedade': 10, 'burnout': 5, 'depressao': 0}
        self.client.post(reverse('avaliacao-list'), data_med)
        insight_med = Insight.objects.filter(funcionario=self.funcionario).latest('gerado_em')
        self.assertIn("Sinais moderados", insight_med.texto)
        self.assertIn("Pratique pausas regulares", insight_med.recomendacoes)

        data_high = {'estresse': 20, 'ansiedade': 20, 'burnout': 10, 'depressao': 5}
        self.client.post(reverse('avaliacao-list'), data_high)
        insight_high = Insight.objects.filter(funcionario=self.funcionario).latest('gerado_em')
        self.assertIn("risco elevado", insight_high.texto)
        self.assertIn("Estresse acima do esperado", insight_high.texto)
        self.assertIn("psicólogo o quanto antes", insight_high.recomendacoes)
        self.assertIn("atividades de descompressão", insight_high.recomendacoes)

