import React from 'react';
import { Card, Input, Button, Select, SelectItem } from '@nextui-org/react';
import { Trash } from 'lucide-react';
import { QuizQuestion, QuestionType } from '../../../types/campaign';
import { QUESTION_TYPES } from '../../../constants';

interface QuestionItemProps {
  question: QuizQuestion;
  index: number;
  onQuestionChange: (index: number, field: string, value: any) => void;
  onTypeChange: (index: number, type: QuestionType) => void;
  onDeleteQuestion: (index: number) => void;
  onOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
  onAddOption: (questionIndex: number) => void;
  onDeleteOption: (questionIndex: number, optionIndex: number) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  index,
  onQuestionChange,
  onTypeChange,
  onDeleteQuestion,
  onOptionChange,
  onAddOption,
  onDeleteOption,
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">Question {index + 1}</h4>
        <Button
          isIconOnly
          variant="light"
          color="danger"
          onClick={() => onDeleteQuestion(index)}
        >
          <Trash size={16} />
        </Button>
      </div>
      
      <div className="space-y-4">
        <Select
          label="Type de question"
          selectedKeys={[question.type]}
          onSelectionChange={(value) =>
            onTypeChange(index, value.currentKey as QuestionType)
          }
        >
          {QUESTION_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </Select>

        <Input
          type="text"
          label="Texte de la question"
          value={question.question}
          onChange={(e) => onQuestionChange(index, 'question', e.target.value)}
        />

        {(question.type === 'multiple-choice') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Options</span>
              <Button
                size="sm"
                variant="light"
                onClick={() => onAddOption(index)}
              >
                Ajouter une option
              </Button>
            </div>
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <Input
                  size="sm"
                  value={option}
                  onChange={(e) => onOptionChange(index, optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onClick={() => onDeleteOption(index, optionIndex)}
                >
                  <Trash size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {question.type === 'true-false' && (
          <Select
            label="Bonne réponse"
            selectedKeys={[String(question.correctAnswer)]}
            onSelectionChange={(value) =>
              onQuestionChange(index, 'correctAnswer', value.currentKey === 'true')
            }
          >
            <SelectItem key="true" value="true">Vrai</SelectItem>
            <SelectItem key="false" value="false">Faux</SelectItem>
          </Select>
        )}
      </div>
    </Card>
  );
};

export default QuestionItem;