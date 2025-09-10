// @ts-nocheck
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import {
  useCanvasElements,
  useSetCanvasElements,
  useSelectedElement,
  useSetSelectedElement,
  useCanvasZoom,
  useSetCanvasZoom,
  useCanvasBackground,
  useSetCanvasBackground,
  useCanvasSize,
  useSetCanvasSize,
  useExtractedColors,
  useSetExtractedColors,
  useElementsOrder,
  useSetElementsOrder,
  useElementsLocked,
  useSetElementsLocked,
  useCanvasGrid,
  useSetCanvasGrid,
  useCanvasBleed,
  useSetCanvasBleed,
  useCanvasSafeZone,
  useSetCanvasSafeZone,
  useCanvasShadow,
  useSetCanvasShadow,
  useCanvasBorder,
  useSetCanvasBorder,
  useCanvasCorner,
  useSetCanvasCorner,
  useCanvasPadding,
  useSetCanvasPadding,
  useCanvasOpacity,
  useSetCanvasOpacity,
  useCanvasRotation,
  useSetCanvasRotation,
  useCanvasSkew,
  useSetCanvasSkew,
  useCanvasScale,
  useSetCanvasScale,
  useCanvasFlip,
  useSetCanvasFlip,
  useCanvasFilter,
  useSetCanvasFilter,
  useCanvasBlendMode,
  useSetCanvasBlendMode,
  useCanvasMask,
  useSetCanvasMask,
  useCanvasClip,
  useSetCanvasClip,
  useCanvasPerspective,
  useSetCanvasPerspective,
  useCanvasPerspectiveOrigin,
  useSetCanvasPerspectiveOrigin,
} from '../../hooks/canvas';
import {
  useCampaign,
  useSetCampaign,
  useCampaignTemplates,
  useSetCampaignTemplates,
  useCampaignFonts,
  useSetCampaignFonts,
  useCampaignColors,
  useSetCampaignColors,
  useCampaignImages,
  useSetCampaignImages,
  useCampaignVideos,
  useSetCampaignVideos,
  useCampaignAudios,
  useSetCampaignAudios,
  useCampaignGradients,
  useSetCampaignGradients,
  useCampaignPatterns,
  useSetCampaignPatterns,
  useCampaignAnimations,
  useSetCampaignAnimations,
  useCampaignTransitions,
  useSetCampaignTransitions,
  useCampaignFilters,
  useSetCampaignFilters,
  useCampaignBlendModes,
  useSetCampaignBlendModes,
  useCampaignMasks,
  useSetCampaignMasks,
  useCampaignClips,
  useSetCampaignClips,
  useCampaignPerspectives,
  useSetCampaignPerspectives,
  useCampaignPerspectiveOrigins,
  useSetCampaignPerspectiveOrigins,
} from '../../hooks/campaign';
import {
  useUser,
  useSetUser,
  useUserTemplates,
  useSetUserTemplates,
  useUserFonts,
  useSetUserFonts,
  useUserColors,
  useSetUserColors,
  useUserImages,
  useSetUserImages,
  useUserVideos,
  useSetUserVideos,
  useUserAudios,
  useSetUserAudios,
  useUserGradients,
  useSetUserGradients,
  useUserPatterns,
  useSetUserPatterns,
  useUserAnimations,
  useSetUserAnimations,
  useUserTransitions,
  useSetUserTransitions,
  useUserFilters,
  useSetUserFilters,
  useUserBlendModes,
  useSetUserBlendModes,
  useUserMasks,
  useSetUserMasks,
  useUserClips,
  useSetUserClips,
  useUserPerspectives,
  useSetUserPerspectives,
  useUserPerspectiveOrigins,
  useSetUserPerspectiveOrigins,
} from '../../hooks/user';
import {
  useWorkspace,
  useSetWorkspace,
  useWorkspaceTemplates,
  useSetWorkspaceTemplates,
  useWorkspaceFonts,
  useSetWorkspaceFonts,
  useWorkspaceColors,
  useSetWorkspaceColors,
  useWorkspaceImages,
  useSetWorkspaceImages,
  useWorkspaceVideos,
  useSetWorkspaceVideos,
  useWorkspaceAudios,
  useSetWorkspaceAudios,
  useWorkspaceGradients,
  useSetWorkspaceGradients,
  useWorkspacePatterns,
  useSetWorkspacePatterns,
  useWorkspaceAnimations,
  useSetWorkspaceAnimations,
  useWorkspaceTransitions,
  useSetWorkspaceTransitions,
  useWorkspaceFilters,
  useSetWorkspaceFilters,
  useWorkspaceBlendModes,
  useSetWorkspaceBlendModes,
  useWorkspaceMasks,
  useSetWorkspaceMasks,
  useWorkspaceClips,
  useSetWorkspaceClips,
  useWorkspacePerspectives,
  useSetWorkspacePerspectives,
  useWorkspacePerspectiveOrigins,
  useSetWorkspacePerspectiveOrigins,
} from '../../hooks/workspace';
import { ItemTypes } from '../../constants';
import { addElementToCanvas } from '../../utils/canvas';
import { useDebounce } from '../../hooks/useDebounce';
import { useHotkeys } from 'react-hotkeys-hook';
import { duplicateElement, deleteElement } from '../../utils/element';
import { useAppDispatch } from '../../redux/hooks';
import { setSidebar } from '../../redux/slices/app';
import { setZoom } from '../../redux/slices/canvas';

interface TemplatedQuizProps {
  children: React.ReactNode;
  template: any;
  onTemplateChange: (template: any) => void;
}

const TemplatedQuiz: React.FC<TemplatedQuizProps> = ({ children, template, onTemplateChange }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Canvas Context
  const canvasElements = useCanvasElements();
  const setCanvasElements = useSetCanvasElements();
  const selectedElement = useSelectedElement();
  const setSelectedElement = useSetSelectedElement();
  const canvasZoom = useCanvasZoom();
  const setCanvasZoom = useSetCanvasZoom();
  const canvasBackground = useCanvasBackground();
  const setCanvasBackground = useSetCanvasBackground();
  const canvasSize = useCanvasSize();
  const setCanvasSize = useSetCanvasSize();
  const extractedColors = useExtractedColors();
  const setExtractedColors = useSetExtractedColors();
  const elementsOrder = useElementsOrder();
  const setElementsOrder = useSetElementsOrder();
  const elementsLocked = useElementsLocked();
  const setElementsLocked = useSetElementsLocked();
  const canvasGrid = useCanvasGrid();
  const setCanvasGrid = useSetCanvasGrid();
  const canvasBleed = useCanvasBleed();
  const setCanvasBleed = useSetCanvasBleed();
  const canvasSafeZone = useCanvasSafeZone();
  const setCanvasSafeZone = useSetCanvasSafeZone();
  const canvasShadow = useCanvasShadow();
  const setCanvasShadow = useSetCanvasShadow();
  const canvasBorder = useCanvasBorder();
  const setCanvasBorder = useSetCanvasBorder();
  const canvasCorner = useCanvasCorner();
  const setCanvasCorner = useSetCanvasCorner();
  const canvasPadding = useCanvasPadding();
  const setCanvasPadding = useSetCanvasPadding();
  const canvasOpacity = useCanvasOpacity();
  const setCanvasOpacity = useSetCanvasOpacity();
  const canvasRotation = useCanvasRotation();
  const setCanvasRotation = useSetCanvasRotation();
  const canvasSkew = useCanvasSkew();
  const setCanvasSkew = useSetCanvasSkew();
  const canvasScale = useCanvasScale();
  const setCanvasScale = useSetCanvasScale();
  const canvasFlip = useCanvasFlip();
  const setCanvasFlip = useSetCanvasFlip();
  const canvasFilter = useCanvasFilter();
  const setCanvasFilter = useSetCanvasFilter();
  const canvasBlendMode = useCanvasBlendMode();
  const setCanvasBlendMode = useSetCanvasBlendMode();
  const canvasMask = useCanvasMask();
  const setCanvasMask = useSetCanvasMask();
  const canvasClip = useCanvasClip();
  const setCanvasClip = useSetCanvasClip();
  const canvasPerspective = useCanvasPerspective();
  const setCanvasPerspective = useSetCanvasPerspective();
  const canvasPerspectiveOrigin = useCanvasPerspectiveOrigin();
  const setCanvasPerspectiveOrigin = useSetCanvasPerspectiveOrigin();

  // Campaign Context
  const campaign = useCampaign();
  const setCampaign = useSetCampaign();
  const campaignTemplates = useCampaignTemplates();
  const setCampaignTemplates = useSetCampaignTemplates();
  const campaignFonts = useCampaignFonts();
  const setCampaignFonts = useSetCampaignFonts();
  const campaignColors = useCampaignColors();
  const setCampaignColors = useSetCampaignColors();
  const campaignImages = useCampaignImages();
  const setCampaignImages = useSetCampaignImages();
  const campaignVideos = useCampaignVideos();
  const setCampaignVideos = useSetCampaignVideos();
  const campaignAudios = useCampaignAudios();
  const setCampaignAudios = useSetCampaignAudios();
  const campaignGradients = useCampaignGradients();
  const setCampaignGradients = useSetCampaignGradients();
  const campaignPatterns = useCampaignPatterns();
  const setCampaignPatterns = useSetCampaignPatterns();
  const campaignAnimations = useCampaignAnimations();
  const setCampaignAnimations = useSetCampaignAnimations();
  const campaignTransitions = useCampaignTransitions();
  const setCampaignTransitions = useSetCampaignTransitions();
  const campaignFilters = useCampaignFilters();
  const setCampaignFilters = useSetCampaignFilters();
  const campaignBlendModes = useCampaignBlendModes();
  const setCampaignBlendModes = useSetCampaignBlendModes();
  const campaignMasks = useCampaignMasks();
  const setCampaignMasks = useSetCampaignMasks();
  const campaignClips = useCampaignClips();
  const setCampaignClips = useSetCampaignClips();
  const campaignPerspectives = useCampaignPerspectives();
  const setCampaignPerspectives = useSetCampaignPerspectives();
  const campaignPerspectiveOrigins = useCampaignPerspectiveOrigins();
  const setCampaignPerspectiveOrigins = useSetCampaignPerspectiveOrigins();

  // User Context
  const user = useUser();
  const setUser = useSetUser();
  const userTemplates = useUserTemplates();
  const setUserTemplates = useSetUserTemplates();
  const userFonts = useUserFonts();
  const setUserFonts = useSetUserFonts();
  const userColors = useUserColors();
  const setUserColors = useSetUserColors();
  const userImages = useUserImages();
  const setUserImages = useSetUserImages();
  const userVideos = useUserVideos();
  const setUserVideos = useSetUserVideos();
  const userAudios = useUserAudios();
  const setUserAudios = useSetUserAudios();
  const userGradients = useUserGradients();
  const setUserGradients = useSetUserGradients();
  const userPatterns = useUserPatterns();
  const setUserPatterns = useSetUserPatterns();
  const userAnimations = useUserAnimations();
  const setUserAnimations = useSetUserAnimations();
  const userTransitions = useUserTransitions();
  const setUserTransitions = useSetUserTransitions();
  const userFilters = useUserFilters();
  const setUserFilters = useSetUserFilters();
  const userBlendModes = useUserBlendModes();
  const setUserBlendModes = useSetUserBlendModes();
  const userMasks = useUserMasks();
  const setUserMasks = useSetUserMasks();
  const userClips = useUserClips();
  const setUserClips = useSetUserClips();
  const userPerspectives = useUserPerspectives();
  const setUserPerspectives = useSetUserPerspectives();
  const userPerspectiveOrigins = useUserPerspectiveOrigins();
  const setUserPerspectiveOrigins = useSetUserPerspectiveOrigins();

  // Workspace Context
  const workspace = useWorkspace();
  const setWorkspace = useSetWorkspace();
  const workspaceTemplates = useWorkspaceTemplates();
  const setWorkspaceTemplates = useSetWorkspaceTemplates();
  const workspaceFonts = useWorkspaceFonts();
  const setWorkspaceFonts = useSetWorkspaceFonts();
  const workspaceColors = useWorkspaceColors();
  const setWorkspaceColors = useSetWorkspaceColors();
  const workspaceImages = useWorkspaceImages();
  const setWorkspaceImages = useSetWorkspaceImages();
  const workspaceVideos = useWorkspaceVideos();
  const setWorkspaceVideos = useSetWorkspaceVideos();
  const workspaceAudios = useWorkspaceAudios();
  const setWorkspaceAudios = useSetWorkspaceAudios();
  const workspaceGradients = useWorkspaceGradients();
  const setWorkspaceGradients = useSetWorkspaceGradients();
  const workspacePatterns = useWorkspacePatterns();
  const setWorkspacePatterns = useSetWorkspacePatterns();
  const workspaceAnimations = useWorkspaceAnimations();
  const setWorkspaceAnimations = useSetWorkspaceAnimations();
  const workspaceTransitions = useWorkspaceTransitions();
  const setWorkspaceTransitions = useSetWorkspaceTransitions();
  const workspaceFilters = useWorkspaceFilters();
  const setWorkspaceFilters = useSetWorkspaceFilters();
  const workspaceBlendModes = useWorkspaceBlendModes();
  const setWorkspaceBlendModes = useSetWorkspaceBlendModes();
  const workspaceMasks = useWorkspaceMasks();
  const setWorkspaceMasks = useSetWorkspaceMasks();
  const workspaceClips = useWorkspaceClips();
  const setWorkspaceClips = useSetWorkspaceClips();
  const workspacePerspectives = useWorkspacePerspectives();
  const setWorkspacePerspectives = useSetWorkspacePerspectives();
  const workspacePerspectiveOrigins = useWorkspacePerspectiveOrigins();
  const setWorkspacePerspectiveOrigins = useSetWorkspacePerspectiveOrigins();

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateTemplate = (newTemplate: any) => {
    onTemplateChange(newTemplate);
  };

  const debouncedTemplate = useDebounce(template, 500);

  useEffect(() => {
    if (debouncedTemplate) {
      updateTemplate(debouncedTemplate);
    }
  }, [debouncedTemplate]);

  useEffect(() => {
    if (template) {
      setCanvasSize({ width: template.width, height: template.height });
      setCanvasElements(template.elements);
      setCanvasBackground(template.background);
    }
  }, [template]);

  const [, drop] = useDrop({
    accept: ItemTypes.ELEMENT,
    drop: (item: any, monitor) => {
      if (!containerRef.current) {
        return;
      }
      const offset = monitor.getClientOffset();
      if (!offset) {
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const x = offset.x - rect.left;
      const y = offset.y - rect.top;

      const newElement = {
        ...item.element,
        id: uuidv4(),
        x: x - item.element.width / 2,
        y: y - item.element.height / 2,
      };

      addElementToCanvas(newElement, canvasElements, setCanvasElements, elementsOrder, setElementsOrder);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isDragging: monitor.isDragging(),
    }),
    canDrop: (item, monitor) => {
      return true;
    },
  });

  useHotkeys(
    'ctrl+c, command+c',
    () => {
      if (selectedElement) {
        navigator.clipboard
          .writeText(JSON.stringify(selectedElement))
          .then(() => {
            // console.log('Copied to clipboard');
          })
          .catch((err) => {
            console.error('Failed to copy: ', err);
          });
      }
    },
    [selectedElement],
  );

  useHotkeys(
    'ctrl+x, command+x',
    () => {
      if (selectedElement) {
        navigator.clipboard
          .writeText(JSON.stringify(selectedElement))
          .then(() => {
            deleteElement(selectedElement.id, canvasElements, setCanvasElements, elementsOrder, setElementsOrder, setSelectedElement);
          })
          .catch((err) => {
            console.error('Failed to copy: ', err);
          });
      }
    },
    [selectedElement, canvasElements, setCanvasElements, elementsOrder, setElementsOrder, setSelectedElement],
  );

  useHotkeys(
    'ctrl+v, command+v',
    () => {
      navigator.clipboard
        .readText()
        .then((text) => {
          try {
            const element = JSON.parse(text);
            const newElement = {
              ...element,
              id: uuidv4(),
              x: element.x + 20,
              y: element.y + 20,
            };
            addElementToCanvas(newElement, canvasElements, setCanvasElements, elementsOrder, setElementsOrder);
          } catch (e) {
            console.error('Could not paste data: ', e);
          }
        })
        .catch((err) => {
          console.error('Failed to read clipboard contents: ', err);
        });
    },
    [canvasElements, setCanvasElements, elementsOrder, setElementsOrder],
  );

  useHotkeys(
    'ctrl+d, command+d',
    () => {
      if (selectedElement) {
        duplicateElement(selectedElement, canvasElements, setCanvasElements, elementsOrder, setElementsOrder);
      }
    },
    [selectedElement, canvasElements, setCanvasElements, elementsOrder, setElementsOrder],
  );

  useHotkeys(
    'backspace, delete',
    () => {
      if (selectedElement) {
        deleteElement(selectedElement.id, canvasElements, setCanvasElements, elementsOrder, setElementsOrder, setSelectedElement);
      }
    },
    [selectedElement, canvasElements, setCanvasElements, elementsOrder, setElementsOrder, setSelectedElement],
  );

  useHotkeys(
    'esc',
    () => {
      dispatch(setSidebar(null));
      setSelectedElement(null);
    },
    [dispatch, setSelectedElement],
  );

  useHotkeys(
    'ctrl+plus, command+plus',
    () => {
      const newZoom = Math.min(canvasZoom + 0.1, 2);
      setCanvasZoom(newZoom);
      dispatch(setZoom(newZoom));
      searchParams.set('zoom', newZoom.toString());
      setSearchParams(searchParams);
    },
    [canvasZoom, dispatch, setCanvasZoom, searchParams, setSearchParams],
  );

  useHotkeys(
    'ctrl+minus, command+minus',
    () => {
      const newZoom = Math.max(canvasZoom - 0.1, 0.1);
      setCanvasZoom(newZoom);
      dispatch(setZoom(newZoom));
      searchParams.set('zoom', newZoom.toString());
      setSearchParams(searchParams);
    },
    [canvasZoom, dispatch, setCanvasZoom, searchParams, setSearchParams],
  );

  const getHoverColor = () => {
    if (isDragging) {
      return 'rgba(0, 255, 0, 0.1)';
    }
    return 'rgba(0, 0, 0, 0.05)';
  };

  const getActiveColor = () => {
    if (selectedElement) {
      return 'rgba(0, 0, 255, 0.1)';
    }
    return 'rgba(0, 0, 0, 0.05)';
  };

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        drop(node);
      }}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: getHoverColor(),
      }}
    >
      {children}
    </div>
  );
};

export default TemplatedQuiz;
