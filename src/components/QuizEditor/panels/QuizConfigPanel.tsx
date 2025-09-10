// @ts-nocheck
import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Input,
  SelectItem,
  Select,
  Textarea,
  Button,
  Tooltip,
  Checkbox,
} from '@nextui-org/react';
import { QuestionType } from '../../../types/QuizTypes';
import {
  DEFAULT_QUIZ_CONFIG,
  DEFAULT_QUESTION_CONFIG,
} from '../../../constants';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

interface QuizConfigPanelProps {
  quizConfig: any;
  questionConfig: any;
  onQuizConfigChange: (config: any) => void;
  onQuestionConfigChange: (config: any) => void;
  onAddQuestion: () => void;
  questionTypes: QuestionType[];
  selectedQuestionType: QuestionType | null;
  setSelectedQuestionType: (type: QuestionType | null) => void;
  isMultipleChoice: boolean;
  setIsMultipleChoice: (isMultipleChoice: boolean) => void;
}

const QuizConfigPanel: React.FC<QuizConfigPanelProps> = ({
  quizConfig,
  questionConfig,
  onQuizConfigChange,
  onQuestionConfigChange,
  onAddQuestion,
  questionTypes,
  selectedQuestionType,
  setSelectedQuestionType,
  isMultipleChoice,
  setIsMultipleChoice,
}) => {
  const { t } = useTranslation();

  const handleQuizConfigChange = useCallback(
    (key: string, value: any) => {
      onQuizConfigChange({
        ...quizConfig,
        [key]: value,
      });
    },
    [quizConfig, onQuizConfigChange]
  );

  const handleQuestionConfigChange = useCallback(
    (key: string, value: any) => {
      onQuestionConfigChange({
        ...questionConfig,
        [key]: value,
      });
    },
    [questionConfig, onQuestionConfigChange]
  );

  const handleAddQuestion = useCallback(() => {
    onAddQuestion();
  }, [onAddQuestion]);

  const handleQuestionTypeChange = useCallback(
    (value: string) => {
      const type = questionTypes.find((type) => type.id === value) || null;
      setSelectedQuestionType(type);
      setIsMultipleChoice(type?.id === 'multiple_choice');
    },
    [questionTypes, setSelectedQuestionType, setIsMultipleChoice]
  );

  const quizConfigFields = useMemo(
    () => [
      {
        key: 'title',
        label: t('quiz_config.title'),
        type: 'text',
        defaultValue: DEFAULT_QUIZ_CONFIG.title,
      },
      {
        key: 'description',
        label: t('quiz_config.description'),
        type: 'textarea',
        defaultValue: DEFAULT_QUIZ_CONFIG.description,
      },
      {
        key: 'successMessage',
        label: t('quiz_config.success_message'),
        type: 'textarea',
        defaultValue: DEFAULT_QUIZ_CONFIG.successMessage,
      },
      {
        key: 'failureMessage',
        label: t('quiz_config.failure_message'),
        type: 'textarea',
        defaultValue: DEFAULT_QUIZ_CONFIG.failureMessage,
      },
    ],
    [t]
  );

  const questionConfigFields = useMemo(
    () => [
      {
        key: 'prompt',
        label: t('question_config.prompt'),
        type: 'textarea',
        defaultValue: DEFAULT_QUESTION_CONFIG.prompt,
      },
      {
        key: 'correctAnswer',
        label: t('question_config.correct_answer'),
        type: 'text',
        defaultValue: DEFAULT_QUESTION_CONFIG.correctAnswer,
      },
      {
        key: 'incorrectAnswer1',
        label: t('question_config.incorrect_answer_1'),
        type: 'text',
        defaultValue: DEFAULT_QUESTION_CONFIG.incorrectAnswer1,
      },
      {
        key: 'incorrectAnswer2',
        label: t('question_config.incorrect_answer_2'),
        type: 'text',
        defaultValue: DEFAULT_QUESTION_CONFIG.incorrectAnswer2,
      },
      {
        key: 'incorrectAnswer3',
        label: t('question_config.incorrect_answer_3'),
        type: 'text',
        defaultValue: DEFAULT_QUESTION_CONFIG.incorrectAnswer3,
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="font-bold text-xl">{t('quiz_config.title')}</div>
        <div className="flex flex-col gap-4 p-4">
          {quizConfigFields.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label htmlFor={field.key}>{field.label}</label>
              {field.type === 'text' ? (
                <Input
                  id={field.key}
                  type="text"
                  value={quizConfig[field.key] || ''}
                  onChange={(e) =>
                    handleQuizConfigChange(field.key, e.target.value)
                  }
                />
              ) : (
                <Textarea
                  id={field.key}
                  value={quizConfig[field.key] || ''}
                  onChange={(e) =>
                    handleQuizConfigChange(field.key, e.target.value)
                  }
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="font-bold text-xl">{t('question_config.title')}</div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="questionType">{t('question_config.type')}</label>
            <Select
              id="questionType"
              placeholder={t('question_config.select_type')}
              selectedKeys={[selectedQuestionType?.id || '']}
              onChange={(e) => handleQuestionTypeChange(e.target.value)}
            >
              {questionTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {t(type.label)}
                </SelectItem>
              ))}
            </Select>
          </div>

          {questionConfigFields.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label htmlFor={field.key}>
                {field.label}
                {field.key === 'correctAnswer' && isMultipleChoice && (
                  <Tooltip
                    content={t('question_config.correct_answer_tooltip')}
                    placement="right"
                  >
                    <Info className="inline-block w-4 h-4 ml-1 text-gray-500" />
                  </Tooltip>
                )}
              </label>
              {field.type === 'text' ? (
                <Input
                  id={field.key}
                  type="text"
                  value={questionConfig[field.key] || ''}
                  onChange={(e) =>
                    handleQuestionConfigChange(field.key, e.target.value)
                  }
                />
              ) : (
                <Textarea
                  id={field.key}
                  value={questionConfig[field.key] || ''}
                  onChange={(e) =>
                    handleQuestionConfigChange(field.key, e.target.value)
                  }
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Button color="primary" onClick={handleAddQuestion}>
        {t('quiz_config.add_question')}
      </Button>
    </div>
  );
};

export default QuizConfigPanel;
