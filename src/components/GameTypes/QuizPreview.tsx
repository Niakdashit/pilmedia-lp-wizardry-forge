import React from 'react';

interface QuizPreviewProps {
  question?: any;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ question }) => {
  if (!question) {
    return (
      <div className="flex items-center justify-center text-gray-500 text-sm p-4 border border-gray-200 rounded-lg h-full">
        Sélectionnez ou ajoutez une question pour la prévisualiser
      </div>
    );
  }

  const { text, image, type, options = [], feedback = {}, timeLimit } = question;
  const renderOptions = () => {
    if (type === 'input') {
      return (
        <input
          type="text"
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Votre réponse"
        />
      );
    }
    const inputType = type === 'multiple' ? 'checkbox' : 'radio';
    return (
      <div className="space-y-2">
        {options.map((opt: any) => (
          <label key={opt.id} className="flex items-center space-x-2">
            <input type={inputType} disabled className="text-[#841b60]" />
            <span>{opt.text || 'Option'}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      {image && (
        <img src={image} alt="" className="w-full h-48 object-cover rounded-lg" />
      )}
      <h3 className="text-lg font-medium">{text || 'Question'}</h3>
      {renderOptions()}
      <div className="text-sm text-gray-400">
        {(feedback.correct || 'Bonne réponse')} / {(feedback.incorrect || 'Mauvaise réponse')}
      </div>
      {timeLimit > 0 && (
        <div className="text-xs text-gray-500">Temps : {timeLimit}s</div>
      )}
    </div>
  );
};

export default QuizPreview;
