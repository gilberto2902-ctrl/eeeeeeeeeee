
import React from 'react';

const UserGuide: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-12">
      <h2 className="text-2xl font-bold text-orange-500 mb-6 border-b border-gray-700 pb-2">Guia de Utilização</h2>
      
      <div className="space-y-8">
        {/* Dashboard */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-900/30 rounded-full text-orange-500">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-white">Dashboard</h3>
          </div>
          <p className="text-gray-300 mb-4">
            A visão geral do seu sistema. Aqui você encontra estatísticas rápidas sobre seus certificados e calibrações pendentes.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm">
            <li>Visualize o total de certificados emitidos.</li>
            <li>Acompanhe calibrações que vencem nos próximos 30 dias.</li>
            <li>Acesse rapidamente os últimos 5 certificados criados.</li>
          </ul>
        </section>

        {/* Novo Certificado */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-900/30 rounded-full text-green-500">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-white">Novo Certificado</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Onde a mágica acontece. Preencha os dados técnicos para gerar o documento de calibração.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm">
            <li><strong>Importante:</strong> Selecione uma empresa na barra lateral antes de começar.</li>
            <li>Preencha os dados do instrumento e do padrão utilizado.</li>
            <li>Insira as medições; o sistema calculará automaticamente os desvios, incertezas e aprovação.</li>
            <li>Use o botão "Visualizar" para conferir o layout antes de salvar.</li>
          </ul>
        </section>

        {/* Ordens de Serviço */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-500">
              <span className="text-2xl">📂</span>
            </div>
            <h3 className="text-xl font-bold text-white">Ordens de Serviço (Pastas)</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Organização por OS. Agrupa todos os certificados que pertencem à mesma Ordem de Serviço.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm">
            <li>Veja quantos itens foram calibrados em cada OS.</li>
            <li>Abra a pasta para gerenciar os certificados individuais daquela ordem.</li>
          </ul>
        </section>

        {/* Empresas */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-500">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-xl font-bold text-white">Gerenciar Empresas</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Cadastre seus clientes aqui para que eles apareçam nas opções de emissão.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm">
            <li>Adicione CNPJ, endereço e contatos.</li>
            <li><strong>Dica:</strong> Use o botão "Auto-preencher" para extrair dados de um PDF ou foto do cartão CNPJ.</li>
          </ul>
        </section>

        {/* Backup e Dados */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-900/30 rounded-full text-red-500">
              <span className="text-2xl">💾</span>
            </div>
            <h3 className="text-xl font-bold text-white">Backup & Dados</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Segurança em primeiro lugar. Embora os dados estejam na nuvem, você pode baixar cópias locais.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm">
            <li>Exporte um arquivo JSON com todo o seu histórico.</li>
            <li>Importe backups antigos se necessário.</li>
            <li>Limpe sua conta se desejar recomeçar do zero (Cuidado: ação irreversível).</li>
          </ul>
        </section>

        {/* Dicas Gerais */}
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <h4 className="text-orange-500 font-bold mb-2 flex items-center gap-2">
            <span>💡</span> Dica de Ouro: Duplicação
          </h4>
          <p className="text-sm text-gray-300">
            Calibrando vários instrumentos iguais? Crie o primeiro, salve, e depois use o botão <strong>"Duplicar"</strong> na lista. 
            Isso poupa tempo, mantendo os dados do instrumento e mudando apenas o que for necessário.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
