// @ts-nocheck
import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  Checkbox,
} from '@nextui-org/react';
import { toast } from 'react-hot-toast';
import { shallow } from 'zustand/shallow';

import { useCampaignEditor } from '../../../providers/CampaignEditor';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_QUIZ_CONFIG,
  QUIZ_TYPES,
  QUESTION_TYPES,
} from '../../../constants';
import {
  QuizConfig,
  QuizQuestion,
  QuestionType,
  QuizType,
} from '../../../types/campaign';
import { arrayMove } from '@dnd-kit/sortable';
import QuestionItem from './QuestionItem';
import { DndContext, DragOverlay, SortableContext } from '@dnd-kit/core';
import {
  verticalListSortingStrategy,
  SortableItem,
} from '../../../DesignEditor/components/SortableList';
import { CSS } from '@dnd-kit/utilities';
import { Trash } from 'lucide-react';

const QuizConfigPanel = () => {
  const { t } = useTranslation();
  const [quizConfig, setQuizConfig, updateCampaign] = useCampaignEditor(
    (state) => [
      state.campaign.quizConfig,
      state.setQuizConfig,
      state.updateCampaign,
    ],
    shallow
  );
  const [activeId, setActiveId] = useState(null);

  const handleConfigChange = useCallback(
    (key: keyof QuizConfig, value: any) => {
      setQuizConfig((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setQuizConfig]
  );

  const handleQuestionChange = useCallback(
    (index: number, key: keyof QuizQuestion, value: any) => {
      setQuizConfig((prev) => {
        const newQuestions = [...prev.questions];
        newQuestions[index] = {
          ...newQuestions[index],
          [key]: value,
        };
        return {
          ...prev,
          questions: newQuestions,
        };
      });
    },
    [setQuizConfig]
  );

  const handleAddQuestion = useCallback(() => {
    setQuizConfig((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: Date.now().toString(),
          type: 'text' as QuestionType,
          question: '',
          correctAnswer: '',
          options: [],
        },
      ],
    }));
  }, [setQuizConfig]);

  const handleDeleteQuestion = useCallback(
    (id: string) => {
      setQuizConfig((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== id),
      }));
    },
    [setQuizConfig]
  );

  const handleTypeChange = useCallback(
    (index: number, value: QuestionType) => {
      setQuizConfig((prev) => {
        const newQuestions = [...prev.questions];
        newQuestions[index] = {
          ...newQuestions[index],
          type: value,
          correctAnswer: '',
          options: [],
        };
        return {
          ...prev,
          questions: newQuestions,
        };
      });
    },
    [setQuizConfig]
  );

  const handleOptionChange = useCallback(
    (index: number, optionIndex: number, value: string) => {
      setQuizConfig((prev) => {
        const newQuestions = [...prev.questions];
        const newOptions = [...newQuestions[index].options];
        newOptions[optionIndex] = value;
        newQuestions[index] = {
          ...newQuestions[index],
          options: newOptions,
        };
        return {
          ...prev,
          questions: newQuestions,
        };
      });
    },
    [setQuizConfig]
  );

  const handleAddOption = useCallback(
    (index: number) => {
      setQuizConfig((prev) => {
        const newQuestions = [...prev.questions];
        newQuestions[index] = {
          ...newQuestions[index],
          options: [...newQuestions[index].options, ''],
        };
        return {
          ...prev,
          questions: newQuestions,
        };
      });
    },
    [setQuizConfig]
  );

  const handleDeleteOption = useCallback(
    (index: number, optionIndex: number) => {
      setQuizConfig((prev) => {
        const newQuestions = [...prev.questions];
        const newOptions = [...newQuestions[index].options];
        newOptions.splice(optionIndex, 1);
        newQuestions[index] = {
          ...newQuestions[index],
          options: newOptions,
        };
        return {
          ...prev,
          questions: newQuestions,
        };
      });
    },
    [setQuizConfig]
  );

  const validateQuiz = useCallback(() => {
    if (!quizConfig.title) {
      toast.error(t('quiz.validation.title'));
      return false;
    }

    if (quizConfig.questions.length === 0) {
      toast.error(t('quiz.validation.questions'));
      return false;
    }

    for (let i = 0; i < quizConfig.questions.length; i++) {
      const question = quizConfig.questions[i];
      if (!question.question) {
        toast.error(t('quiz.validation.question', { promptNumber: i + 1 }));
        return false;
      }

      if (question.type !== 'text' && question.options.length < 2) {
        toast.error(t('quiz.validation.options', { promptNumber: i + 1 }));
        return false;
      }

      if (!question.correctAnswer) {
        toast.error(t('quiz.validation.correctAnswer', {
          promptNumber: i + 1,
        }));
        return false;
      }
    }

    return true;
  }, [quizConfig, t]);

  const handleValidate = useCallback(() => {
    if (validateQuiz()) {
      updateCampaign({ quizConfig });
      toast.success(t('quiz.validation.success'));
    }
  }, [quizConfig, t, updateCampaign, validateQuiz]);

  const onDragEnd = useCallback(
    (event) => {
      setActiveId(null);
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = quizConfig.questions.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = quizConfig.questions.findIndex(
        (item) => item.id === over.id
      );

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      setQuizConfig((prev) => ({
        ...prev,
        questions: arrayMove(prev.questions, oldIndex, newIndex),
      }));
    },
    [quizConfig.questions, setQuizConfig]
  );

  const getItemStyle = useCallback(
    (id: string) => (activeId === id ? 'opacity-50' : ''),
    [activeId]
  );

  const handleReset = useCallback(() => {
    setQuizConfig(DEFAULT_QUIZ_CONFIG);
  }, [setQuizConfig]);

  const items = useMemo(() => quizConfig.questions.map((q) => q.id), [
    quizConfig.questions,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold">{t('quiz.title')}</h3>
        <Input
          type="text"
          label={t('quiz.config.title')}
          value={quizConfig.title}
          onValueChange={(value) => handleConfigChange('title', value)}
        />
        <Select
          label={t('quiz.config.type')}
          selectedKeys={[quizConfig.type]}
          onSelectionChange={(value) =>
            handleConfigChange('type', value.currentKey)
          }
        >
          {QUIZ_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {t(type.label)}
            </SelectItem>
          ))}
        </Select>
        {quizConfig.type === 'survey' && (
          <Checkbox
            isSelected={quizConfig.allowSkip}
            onChange={(value) => handleConfigChange('allowSkip', value)}
          >
            {t('quiz.config.allowSkip')}
          </Checkbox>
        )}
        <Textarea
          label={t('quiz.config.description')}
          value={quizConfig.description}
          onValueChange={(value) => handleConfigChange('description', value)}
        />
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('quiz.questions')}</h3>
          <Button color="primary" size="sm" onClick={handleAddQuestion}>
            {t('quiz.addQuestion')}
          </Button>
        </div>
        <DndContext onDragEnd={onDragEnd} onDragStart={(e) => setActiveId(e.active.id)}>
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 mt-4">
              {quizConfig.questions.map((question, index) => (
                <SortableItem key={question.id} id={question.id}>
                  <Card
                    className={`p-4 ${getItemStyle(question.id)}`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-semibold">
                        {t('quiz.question')} #{index + 1}
                      </h4>
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash />
                      </Button>
                    </div>
                    <Select
                      label={t('quiz.questionType')}
                      selectedKeys={[question.type]}
                      onSelectionChange={(value) =>
                        handleTypeChange(index, value.currentKey as QuestionType)
                      }
                    >
                      {QUESTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {t(type.label)}
                        </SelectItem>
                      ))}
                    </Select>
                    <Input
                      type="text"
                      label={t('quiz.questionText')}
                      value={question.question}
                      onValueChange={(value) =>
                        handleQuestionChange(index, 'question', value)
                      }
                    />
                    {question.type === 'text' ? (
                      <Input
                        type="text"
                        label={t('quiz.correctAnswer')}
                        value={question.correctAnswer}
                        onValueChange={(value) =>
                          handleQuestionChange(index, 'correctAnswer', value)
                        }
                      />
                    ) : (
                      <>
                        <h5 className="text-sm font-semibold mt-2">
                          {t('quiz.options')}
                        </h5>
                        <div className="flex flex-col gap-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input
                                type="text"
                                placeholder={`${t('quiz.option')} #${optionIndex + 1}`}
                                value={option}
                                onValueChange={(value) =>
                                  handleOptionChange(index, optionIndex, value)
                                }
                              />
                              <Button
                                isIconOnly
                                color="danger"
                                variant="light"
                                onClick={() => handleDeleteOption(index, optionIndex)}
                              >
                                <Trash />
                              </Button>
                            </div>
                          ))}
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => handleAddOption(index)}
                          >
                            {t('quiz.addOption')}
                          </Button>
                        </div>
                        <Input
                          type="text"
                          label={t('quiz.correctAnswer')}
                          placeholder={t('quiz.correctAnswerPlaceholder')}
                          value={question.correctAnswer}
                          onValueChange={(value) =>
                            handleQuestionChange(index, 'correctAnswer', value)
                          }
                        />
                      </>
                    )}
                  </Card>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <Card className="p-4">
                <h4 className="text-md font-semibold">
                  {t('quiz.question')} #
                </h4>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Card>
      <div className="flex justify-end gap-2">
        <Button color="primary" onClick={handleValidate}>
          {t('quiz.validate')}
        </Button>
        <Button color="secondary" onClick={handleReset}>
          {t('reset')}
        </Button>
      </div>
    </div>
  );
};

export default QuizConfigPanel;
