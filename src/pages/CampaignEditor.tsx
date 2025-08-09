import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import CampaignEditorHeader from '../components/CampaignEditor/CampaignEditorHeader';
import CampaignEditorTabs from '../components/CampaignEditor/CampaignEditorTabs';
import CampaignEditorContent from '../components/CampaignEditor/CampaignEditorContent';
import PreviewModal from '../components/CampaignEditor/PreviewModal';
import CampaignMobile from '../components/CampaignEditor/CampaignMobile';
import FormEditor from '../components/campaign/FormEditor';
import ParticipationsViewer from '../components/campaign/ParticipationsViewer';
import { CampaignType, getDefaultGameConfig } from '../utils/campaignTypes';
import { useCampaigns } from '../hooks/useCampaigns';
import { FormField } from '../components/campaign/FormEditor';

// Champs du formulaire par défaut
const defaultFormFields: FormField[] = [{
  id: 'prenom',
  label: 'Prénom',
  type: 'text',
  required: true
}, {
  id: 'nom',
  label: 'Nom',
  type: 'text',
  required: true
}, {
  id: 'email',
  label: 'Email',
  type: 'email',
  required: true
}];
const defaultJackpotConfig = {
  symbols: ['🍒', '🍋', '🍊'],
  reels: 3,
  winMessage: 'JACKPOT ! Vous avez gagné !',
  loseMessage: 'Dommage, pas de jackpot !',
  instantWin: {
    enabled: false,
    winProbability: 0.05,
    maxWinners: undefined
  }
};
const CampaignEditor: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNewCampaign = id === 'new';
  const campaignType = searchParams.get('type') as CampaignType || 'quiz';
  const [activeTab, setActiveTab] = useState('general');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const {
    saveCampaign,
    getCampaign
  } = useCampaigns();
  const [campaign, setCampaign] = useState<any>({
    id: undefined,
    name: isNewCampaign ? 'Nouvelle Campagne' : 'Quiz Marketing Digital',
    description: isNewCampaign ? '' : 'Quiz pour évaluer les connaissances en marketing digital',
    url: isNewCampaign ? '' : 'quiz-marketing-digital',
    startDate: isNewCampaign ? '' : '2025-03-15',
    startTime: isNewCampaign ? '' : '09:00',
    endDate: isNewCampaign ? '' : '2025-04-15',
    endTime: isNewCampaign ? '' : '18:00',
    status: isNewCampaign ? 'draft' : 'active',
    type: campaignType,
    screens: {
      1: {
        title: 'Bienvenue !',
        description: 'Participez à notre jeu et tentez de gagner !',
        buttonText: 'Participer',
        buttonLink: '',
        showTitle: true,
        showDescription: true
      },
      2: {},
      3: {
        title: 'Félicitations !',
        description: 'Merci pour votre participation !',
        buttonText: 'Rejouer',
        buttonLink: '',
        showTitle: true,
        showDescription: true,
        showReplayButton: true
      }
    },
    formFields: defaultFormFields,
    gameConfig: getDefaultGameConfig(campaignType),
    design: {
      background: '#ebf4f7',
      fontFamily: 'Inter',
      primaryColor: '#841b60',
      secondaryColor: '#ffffff',
      titleColor: '#000000',
      buttonColor: '#841b60',
      blockColor: '#ffffff',
      borderColor: '#E5E7EB',
      borderRadius: '0.5rem',
      shadow: 'shadow-md',
      titleFont: 'Inter, sans-serif',
      textFont: 'Inter, sans-serif',
      fontSize: 'normal',
      fontWeight: 'normal',
      logoUrl: '',
      backgroundImage: '',
      mobileBackgroundImage: ''
    },
    rewards: {
      mode: 'probability',
      quantity: 10,
      probability: 10,
      timeSlots: []
    },
    config: {
      jackpot: defaultJackpotConfig,
      roulette: {
        segments: [],
        centerImage: null,
        theme: 'default',
        borderColor: '#841b60',
        pointerColor: '#841b60'
      }
    },
    mobileConfig: {
      roulette: {
        segments: [],
        centerImage: null,
        theme: 'default',
        borderColor: '#841b60',
        pointerColor: '#841b60'
      },
      gamePosition: 'center',
      buttonPosition: 'below',
      textPosition: 'top',
      horizontalPadding: 16,
      verticalSpacing: 20,
      backgroundMode: 'cover',
      backgroundColor: '#ebf4f7',
      backgroundImage: null,
      logoOverlay: null,
      logoPosition: 'top-right',
      decorativeOverlay: null,
      customTemplate: null,
      fontFamily: 'Inter',
      title: null,
      description: null,
      showTitle: true,
      showDescription: true,
      titleColor: '#000000',
      titleSize: 'text-2xl',
      titleWeight: 'font-bold',
      titleAlignment: 'text-center',
      descriptionColor: '#666666',
      descriptionSize: 'text-base',
      descriptionAlignment: 'text-center',
      gameVerticalAlign: 'center',
      gameVerticalOffset: 0,
      gameHorizontalOffset: 0, // <--- merge OK
      gameMaxWidth: 90,
      gameMaxHeight: 60,
      gamePaddingX: 16,
      gamePaddingY: 16,
      autoResize: true,
      fullscreenGame: false,
      buttonPlacement: 'bottom',
      buttonText: null,
      buttonColor: '#841b60',
      buttonTextColor: '#ffffff',
      buttonShape: 'rounded-lg',
      buttonSize: 'medium',
      buttonShadow: 'shadow-md',
      buttonMargin: 16,
      buttonWidth: 80,
      buttonHoverEffect: true
    }
  });
  useEffect(() => {
    if (isNewCampaign && !searchParams.get('type')) {
      navigate('/campaigns');
    }
  }, [isNewCampaign, searchParams, navigate]);
  useEffect(() => {
    if (!isNewCampaign && id) {
      loadCampaign(id);
    }
  }, [id, isNewCampaign]);
  const loadCampaign = async (campaignId: string) => {
    const existingCampaign = await getCampaign(campaignId);
    if (existingCampaign) {
      setCampaign({
        ...existingCampaign,
        formFields: existingCampaign.form_fields || defaultFormFields
      });
    }
  };
  const handleSave = async (continueEditing = false) => {
    if (campaign.type === 'quiz') {
      const questions = campaign.gameConfig?.quiz?.questions || [];
      const valid = questions.every((q: any) =>
        Array.isArray(q.options) && q.options.length >= 2 && q.options.some((o: any) => o.isCorrect)
      );
      if (!valid) {
        alert('Chaque question doit comporter au moins deux options et une réponse correcte.');
        return;
      }
    }
    const campaignData = {
      ...campaign,
      form_fields: campaign.formFields
    };
    const savedCampaign = await saveCampaign(campaignData);
    if (savedCampaign && !continueEditing) {
      navigate('/campaigns');
    } else if (savedCampaign && isNewCampaign) {
      setCampaign((prev: any) => ({
        ...prev,
        id: savedCampaign.id
      }));
    }
  };
  return <div className="h-[calc(100vh-3rem)] flex flex-col mx-0">
      <CampaignEditorHeader isNewCampaign={isNewCampaign} campaignName={campaign.name} onPreview={() => setShowPreviewModal(true)} onSave={handleSave} />

      <div className="flex flex-1 overflow-hidden bg-white rounded-xl shadow-sm">
        <div className="flex flex-col w-full">
          <CampaignEditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'mobile' ? <CampaignMobile campaign={campaign} setCampaign={setCampaign} /> : activeTab === 'form' ? <FormEditor formFields={campaign.formFields || []} setFormFields={fields => setCampaign((prev: any) => ({
          ...prev,
          formFields: fields
        }))} /> : activeTab === 'participations' ? <ParticipationsViewer campaignId={campaign.id || ''} campaignName={campaign.name} /> : <CampaignEditorContent activeTab={activeTab} campaign={campaign} setCampaign={setCampaign} />}
        </div>
      </div>

      {showPreviewModal && <PreviewModal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} campaign={campaign} />}
    </div>;
};
export default CampaignEditor;
