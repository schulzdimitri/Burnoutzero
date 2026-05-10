from django.utils import timezone
from django.db.models import Avg
from rest_framework import generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import User, Avaliacao, Acompanhamento, Agendamento, Insight, PontosGamificacao
from .serializers import (
    UserSerializer, UserCreateSerializer,
    AvaliacaoSerializer, AcompanhamentoSerializer,
    AgendamentoSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    authentication_classes = ()
    serializer_class = UserCreateSerializer


class UserDetailView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class AvaliacaoViewSet(viewsets.ModelViewSet):
    serializer_class = AvaliacaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'funcionario':
            return Avaliacao.objects.filter(funcionario=user)
        elif user.role == 'gestor':
            funcionarios = User.objects.filter(
                departamento=user.departamento
            )
            return Avaliacao.objects.filter(
                funcionario__in=funcionarios
            )
        else:
            return Avaliacao.objects.all()

    def perform_create(self, serializer):
        data = serializer.validated_data
        total = (
            data.get('exaustao_emocional', 0)
            + data.get('despersonalizacao', 0)
            - data.get('realizacao_profissional', 0)
        )

        if total > 50:
            risco = 'alto'
        elif total > 20:
            risco = 'medio'
        else:
            risco = 'baixo'

        avaliacao = serializer.save(
            funcionario=self.request.user, nivel_risco=risco
        )

        _gerar_insight(self.request.user, avaliacao)


class AcompanhamentoViewSet(viewsets.ModelViewSet):
    serializer_class = AcompanhamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'psicologo':
            return Acompanhamento.objects.filter(psicologo=user)
        elif user.role == 'funcionario':
            return Acompanhamento.objects.filter(
                funcionario=user
            )
        return Acompanhamento.objects.none()

    def perform_create(self, serializer):
        serializer.save(psicologo=self.request.user)


class AgendamentoViewSet(viewsets.ModelViewSet):
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'funcionario':
            return Agendamento.objects.filter(funcionario=user)
        return Agendamento.objects.none()

    def perform_create(self, serializer):
        serializer.save(funcionario=self.request.user)

# ── Geração automática de insight por regra ───────────────────────────────────

def _gerar_insight(funcionario, avaliacao):
    linhas = []
    recs = []

    if avaliacao.nivel_risco == 'alto':
        linhas.append("Nível de risco elevado identificado na sua avaliação.")
        recs.append("Recomendamos buscar apoio com um psicólogo o quanto antes.")
    elif avaliacao.nivel_risco == 'medio':
        linhas.append("Sinais moderados de esgotamento detectados.")
        recs.append("Pratique pausas regulares e converse com alguém de confiança.")
    else:
        linhas.append("Seus indicadores estão dentro da faixa esperada.")
        recs.append("Continue mantendo seus hábitos saudáveis!")

    if avaliacao.exaustao_emocional > 15:
        linhas.append("Exaustão emocional acima do esperado.")
        recs.append("Considere atividades de descompressão como exercícios leves.")

    Insight.objects.create(
        funcionario=funcionario,
        avaliacao=avaliacao,
        texto=" ".join(linhas),
        recomendacoes=" ".join(recs),
    )
    PontosGamificacao.objects.create(
        funcionario=funcionario,
        pontos=10,
        motivo='avaliacao_completa',
    )


# ── Insights ──────────────────────────────────────────────────────────────────

class InsightViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'funcionario':
            return Insight.objects.filter(funcionario=user)
        elif user.role == 'psicologo':
            return Insight.objects.filter(validado_por=None)
        return Insight.objects.all()

    def get_serializer_class(self):
        from rest_framework import serializers
        class InsightSerializer(serializers.ModelSerializer):
            class Meta:
                model = Insight
                fields = '__all__'
        return InsightSerializer


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def validar_insight(request, pk):
    if request.user.role != 'psicologo':
        return Response({'error': 'Acesso negado.'}, status=403)
    try:
        insight = Insight.objects.get(pk=pk)
    except Insight.DoesNotExist:
        return Response({'error': 'Insight não encontrado.'}, status=404)
    if 'texto' in request.data:
        insight.texto = request.data['texto']
    if 'recomendacoes' in request.data:
        insight.recomendacoes = request.data['recomendacoes']
    insight.validado_por = request.user
    insight.validado_em = timezone.now()
    insight.save()
    return Response({'message': 'Insight validado.'})


# ── Dashboard Gestor ──────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_overview(request):
    if request.user.role != 'gestor':
        return Response({'error': 'Acesso negado.'}, status=403)
    funcionarios = User.objects.filter(departamento=request.user.departamento)
    agg = Avaliacao.objects.filter(funcionario__in=funcionarios).aggregate(
        media_exaustao=Avg('exaustao_emocional'),
        media_despersonalizacao=Avg('despersonalizacao'),
        media_realizacao=Avg('realizacao_profissional'),
    )
    alertas = Avaliacao.objects.filter(
        funcionario__in=funcionarios, nivel_risco='alto'
    ).values('funcionario__username', 'data_avaliacao').order_by('-data_avaliacao')[:10]
    return Response({'medias': agg, 'alertas_recentes': list(alertas)})


# ── Gamificação ───────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def minha_pontuacao(request):
    pontos = PontosGamificacao.objects.filter(funcionario=request.user)
    total = sum(p.pontos for p in pontos)
    historico = list(pontos.values('pontos', 'motivo', 'conquistado_em'))
    return Response({'total_pontos': total, 'historico': historico})