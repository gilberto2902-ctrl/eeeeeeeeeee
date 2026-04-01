
export const GUIDE_DATA = {
  dashboard: {
    title: "Dashboard",
    icon: "📊",
    description: "A visão geral do seu sistema. Aqui você encontra estatísticas rápidas sobre seus certificados e calibrações pendentes.",
    tips: [
      "Visualize o total de certificados emitidos.",
      "Acompanhe calibrações que vencem nos próximos 30 dias.",
      "Acesse rapidamente os últimos 5 certificados criados."
    ]
  },
  'new-certificate': {
    title: "Novo Certificado",
    icon: "📝",
    description: "Onde a mágica acontece. Preencha os dados técnicos para gerar o documento de calibração.",
    tips: [
      "Importante: Selecione uma empresa na barra lateral antes de começar.",
      "Preencha os dados do instrumento e do padrão utilizado.",
      "Insira as medições; o sistema calculará automaticamente os desvios, incertezas e aprovação.",
      "Use o botão 'Visualizar' para conferir o layout antes de salvar."
    ]
  },
  'os-folders': {
    title: "Ordens de Serviço",
    icon: "📂",
    description: "Organização por OS. Agrupa todos os certificados que pertencem à mesma Ordem de Serviço.",
    tips: [
      "Veja quantos itens foram calibrados em cada OS.",
      "Abra a pasta para gerenciar os certificados individuais daquela ordem."
    ]
  },
  list: {
    title: "Certificados Salvos",
    icon: "📜",
    description: "Lista completa de todos os certificados emitidos para a empresa selecionada.",
    tips: [
      "Busque por TAG, Modelo ou Nº da OS.",
      "Visualize, edite, duplique ou exclua certificados.",
      "Filtre por ano na barra lateral para facilitar a busca."
    ]
  },
  companies: {
    title: "Empresas",
    icon: "🏢",
    description: "Cadastre seus clientes aqui para que eles apareçam nas opções de emissão.",
    tips: [
      "Adicione CNPJ, endereço e contatos.",
      "Dica: Use o botão 'Auto-preencher' para extrair dados de um PDF ou foto do cartão CNPJ."
    ]
  },
  'data-management': {
    title: "Backup & Dados",
    icon: "💾",
    description: "Segurança em primeiro lugar. Embora os dados estejam na nuvem, você pode baixar cópias locais.",
    tips: [
      "Exporte um arquivo JSON com todo o seu histórico.",
      "Importe backups antigos se necessário.",
      "Limpe sua conta se desejar recomeçar do zero (Cuidado: ação irreversível)."
    ]
  }
};
