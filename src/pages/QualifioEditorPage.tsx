import React, { useState } from 'react';
import QualifioEditor from '../components/QualifioEditor/QualifioEditor';

const QualifioEditorPage: React.FC = () => {
  const [campaign, setCampaign] = useState({
    id: 'new',
    title: 'Grand Jeu Lectures de l\'été',
    banner: {
      image: '',
      title: 'GRAND JEU',
      subtitle: 'LECTURES DE L\'ÉTÉ'
    },
    content: {
      text: 'En 1988, Paulo Coelho et son épouse Chris entament un voyage de quarante jours dans le désert du Mojave, en Californie. Là, l\'écrivain fait la rencontre de Valhalla, la première des Valkyries - mystérieuse bande de femmes guerrières sillonnant le désert à cheval. Suivant son exemple, il affronte les démons qui sont siens, cherche son ange gardien, et s\'interroge : sommes-nous condamnés à détruire ce que nous aimons le plus ? Comment, à force d\'amour et de volonté, pouvons-nous changer notre destin et celui de nos semblables ? Captivant voyage initiatique, Les Valkyries nous retrace la quête mystique et bouleversante de Paulo Coelho et, à travers elle, la lutte d\'un homme contre le doute et la peur, et son ardent désir de croire qu\'une renaissance est possible.'
    },
    publisher: {
      name: 'editions.flammarion.com',
      url: 'https://editions.flammarion.com'
    },
    prize: {
      description: 'Jouez et tentez de remporter l\'un des 10 exemplaires de "Les Valkyries" d\'une valeur unitaire de 21 euros !',
      buttonText: 'PARTICIPER !'
    },
    settings: {
      width: 810,
      height: 1200,
      backgroundColor: '#ffffff'
    }
  });

  return (
    <QualifioEditor
      campaign={campaign}
      setCampaign={setCampaign}
    />
  );
};

export default QualifioEditorPage;