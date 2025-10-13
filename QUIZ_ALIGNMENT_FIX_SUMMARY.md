# 🎯 Quiz Alignment Fix - Summary

## Problem
The quiz component was always centered (vertically and horizontally) in preview mode, regardless of the layout configuration defined in the editor. This caused a visual mismatch between the editor and preview modes.

## Root Cause
Multiple components were using hardcoded `flex items-center justify-center` CSS classes, forcing the quiz to always be centered:
- `QuizPreview.tsx` (line 48)
- `DesignCanvas.tsx` (line 1987 and 2442)

## Solution Implemented

### 1. Created `useScreenLayout` Hook
**File:** `/src/hooks/useScreenLayout.ts`

A reusable hook that:
- Converts layout configuration to CSS flexbox styles
- Supports `align` (top/center/bottom) and `justify` (left/center/right)
- Handles padding (uniform or per-side)
- Provides default centered layout when no configuration exists

```typescript
export interface ScreenLayout {
  align?: 'top' | 'center' | 'bottom';
  justify?: 'left' | 'center' | 'right';
  padding?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}
```

### 2. Updated `QuizPreview.tsx`
**Changes:**
- Added `campaign` prop to receive layout configuration
- Imported `useScreenLayout` and `getLayoutFromCampaign`
- Replaced hardcoded `flex items-center justify-center` with dynamic `layoutStyle`
- Quiz now respects the layout configuration from the campaign

### 3. Updated `DesignCanvas.tsx`
**Changes:**
- Imported `useScreenLayout` and `getLayoutFromCampaign`
- Added `quizLayout` and `quizLayoutStyle` memoized values
- Updated `customElementRenderers` to use dynamic layout (line 1992)
- Updated inline quiz preview to use dynamic layout (line 2442)
- Both editor and preview now use the same positioning logic

## Files Modified
1. ✅ `/src/hooks/useScreenLayout.ts` (created)
2. ✅ `/src/components/GameTypes/QuizPreview.tsx`
3. ✅ `/src/components/QuizEditor/DesignCanvas.tsx`

## Expected Behavior
- **Editor mode**: Quiz positioned according to layout configuration
- **Preview mode**: Quiz positioned EXACTLY the same as in editor mode
- **Default**: If no layout is configured, quiz remains centered (backward compatible)

## Layout Configuration Location
The layout can be stored in multiple places (checked in order):
1. `campaign.design.layout`
2. `campaign.design.quizConfig.layout`
3. `campaign.layout`

## Usage Example
```typescript
// In campaign configuration
const campaign = {
  design: {
    layout: {
      align: 'top',        // top | center | bottom
      justify: 'left',     // left | center | right
      padding: 20,         // uniform padding
      paddingTop: 40       // override top padding
    }
  }
};
```

## Result
```json
{
  "quiz_alignment_fixed": true,
  "affected_files": [
    "hooks/useScreenLayout.ts",
    "components/GameTypes/QuizPreview.tsx",
    "components/QuizEditor/DesignCanvas.tsx"
  ],
  "alignment_behavior": "synchronized with screen layout configuration"
}
```

## Testing Checklist
- [ ] Quiz centered by default (no layout config)
- [ ] Quiz top-left when `align: 'top', justify: 'left'`
- [ ] Quiz top-right when `align: 'top', justify: 'right'`
- [ ] Quiz bottom-center when `align: 'bottom', justify: 'center'`
- [ ] Padding applied correctly
- [ ] Editor and preview show identical positioning
- [ ] Works on desktop, tablet, and mobile devices

## Future Improvements
- Add UI controls in the editor to configure layout visually
- Store layout configuration in campaign state
- Add layout presets (top-left, center, bottom-right, etc.)
- Add visual guides in editor to show alignment zones
