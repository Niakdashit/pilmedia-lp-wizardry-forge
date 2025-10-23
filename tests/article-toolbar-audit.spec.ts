import { test, expect } from '@playwright/test';

test.describe('Article Mode Toolbar Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to design editor in article mode
    await page.goto('http://localhost:5173/design-editor?mode=article');
    await page.waitForLoadState('networkidle');
    
    // Wait for the editor to be ready
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });
  });

  test('should display all toolbar buttons with correct icons', async ({ page }) => {
    // Check Format dropdown
    const formatSelect = page.locator('select').first();
    await expect(formatSelect).toBeVisible();
    await expect(formatSelect).toContainText('Format');

    // Check color picker (A ▾)
    const colorPicker = page.locator('button[title="Couleur du texte"]');
    await expect(colorPicker).toBeVisible();
    await expect(colorPicker).toContainText('A');

    // Check Bold (B)
    const boldBtn = page.locator('button[title="Gras"]');
    await expect(boldBtn).toBeVisible();
    await expect(boldBtn).toContainText('B');

    // Check Italic (I)
    const italicBtn = page.locator('button[title="Italique"]');
    await expect(italicBtn).toBeVisible();
    await expect(italicBtn).toContainText('I');

    // Check Underline (U)
    const underlineBtn = page.locator('button[title="Souligné"]');
    await expect(underlineBtn).toBeVisible();
    await expect(underlineBtn).toContainText('U');

    // Check Subscript (x₂)
    const subscriptBtn = page.locator('button[title="Indice"]');
    await expect(subscriptBtn).toBeVisible();

    // Check Ordered List
    const orderedListBtn = page.locator('button[title="Liste numérotée"]');
    await expect(orderedListBtn).toBeVisible();

    // Check Unordered List
    const unorderedListBtn = page.locator('button[title="Liste à puces"]');
    await expect(unorderedListBtn).toBeVisible();

    // Check alignment buttons
    await expect(page.locator('button[title="Aligner à gauche"]')).toBeVisible();
    await expect(page.locator('button[title="Centrer"]')).toBeVisible();
    await expect(page.locator('button[title="Aligner à droite"]')).toBeVisible();
    await expect(page.locator('button[title="Justifier"]')).toBeVisible();

    // Check link buttons
    await expect(page.locator('button[title="Insérer un lien"]')).toBeVisible();
    await expect(page.locator('button[title="Supprimer le lien"]')).toBeVisible();

    // Check image button
    await expect(page.locator('button[title="Insérer une image"]')).toBeVisible();

    // Check table button
    await expect(page.locator('button[title="Insérer un tableau"]')).toBeVisible();

    // Check Source button
    const sourceBtn = page.locator('button:has-text("Source")');
    await expect(sourceBtn).toBeVisible();
  });

  test('Bold button should apply bold formatting', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    // Type some text
    await editor.click();
    await editor.type('Test bold text');
    
    // Select all text
    await page.keyboard.press('Control+A');
    
    // Click bold button
    await page.locator('button[title="Gras"]').click();
    
    // Check if text is bold
    const boldText = editor.locator('b, strong');
    await expect(boldText).toBeVisible();
  });

  test('Italic button should apply italic formatting', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('Test italic text');
    
    await page.keyboard.press('Control+A');
    await page.locator('button[title="Italique"]').click();
    
    const italicText = editor.locator('i, em');
    await expect(italicText).toBeVisible();
  });

  test('Underline button should apply underline formatting', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('Test underline text');
    
    await page.keyboard.press('Control+A');
    await page.locator('button[title="Souligné"]').click();
    
    const underlineText = editor.locator('u');
    await expect(underlineText).toBeVisible();
  });

  test('Ordered list button should create numbered list', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('First item');
    
    await page.locator('button[title="Liste numérotée"]').click();
    
    // Check if OL element exists
    const orderedList = editor.locator('ol');
    await expect(orderedList).toBeVisible();
    
    const listItem = editor.locator('li');
    await expect(listItem).toBeVisible();
  });

  test('Unordered list button should create bullet list', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('First item');
    
    await page.locator('button[title="Liste à puces"]').click();
    
    // Check if UL element exists
    const unorderedList = editor.locator('ul');
    await expect(unorderedList).toBeVisible();
    
    const listItem = editor.locator('li');
    await expect(listItem).toBeVisible();
  });

  test('Align left button should align text to left', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('Test alignment');
    
    await page.keyboard.press('Control+A');
    await page.locator('button[title="Aligner à gauche"]').click();
    
    // Check for left alignment style
    const content = await editor.innerHTML();
    expect(content).toContain('text-align');
  });

  test('Center button should center text', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('Test center');
    
    await page.keyboard.press('Control+A');
    await page.locator('button[title="Centrer"]').click();
    
    const content = await editor.innerHTML();
    expect(content).toContain('center');
  });

  test('Align right button should align text to right', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('Test right align');
    
    await page.keyboard.press('Control+A');
    await page.locator('button[title="Aligner à droite"]').click();
    
    const content = await editor.innerHTML();
    expect(content).toContain('right');
  });

  test('Justify button should justify text', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('Test justify text with multiple words');
    
    await page.keyboard.press('Control+A');
    await page.locator('button[title="Justifier"]').click();
    
    const content = await editor.innerHTML();
    expect(content).toContain('justify');
  });

  test('Source button should toggle between WYSIWYG and HTML source', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('Test source mode');
    
    // Click Source button
    await page.locator('button:has-text("Source")').click();
    
    // Should show textarea in source mode
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    
    const textareaContent = await textarea.inputValue();
    expect(textareaContent).toContain('Test source mode');
    
    // Click Source button again to go back to WYSIWYG
    await page.locator('button:has-text("WYSIWYG")').click();
    await expect(editor).toBeVisible();
  });

  test('Format dropdown should change paragraph format', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('Test heading');
    
    await page.keyboard.press('Control+A');
    
    // Select H1 from dropdown
    const formatSelect = page.locator('select').first();
    await formatSelect.selectOption('h1');
    
    // Check if H1 element exists
    const heading = editor.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('Color picker should be functional', async ({ page }) => {
    const colorBtn = page.locator('button[title="Couleur du texte"]');
    await expect(colorBtn).toBeVisible();
    
    // Check that clicking opens color input (hidden but functional)
    const colorInput = page.locator('input[type="color"]');
    await expect(colorInput).toBeAttached();
  });

  test('Link button should prompt for URL', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('Link text');
    await page.keyboard.press('Control+A');
    
    // Setup dialog handler
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('URL');
      await dialog.accept('https://example.com');
    });
    
    await page.locator('button[title="Insérer un lien"]').click();
    
    // Check if link was created
    const link = editor.locator('a');
    await expect(link).toBeVisible();
  });

  test('Image button should prompt for image URL', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    
    // Setup dialog handler
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('image');
      await dialog.accept('https://example.com/image.jpg');
    });
    
    await page.locator('button[title="Insérer une image"]').click();
    
    // Check if image was inserted
    const img = editor.locator('img');
    await expect(img).toBeVisible();
  });

  test('Subscript button should apply subscript formatting', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('H2O');
    
    // Select just the "2"
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Shift+ArrowLeft');
    
    await page.locator('button[title="Indice"]').click();
    
    const subText = editor.locator('sub');
    await expect(subText).toBeVisible();
  });

  test('Toolbar should not cause caret to jump while typing', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    
    // Type multiple characters quickly
    await editor.type('abcdefghijklmnop', { delay: 50 });
    
    // Get the text content
    const content = await editor.textContent();
    
    // Text should be in correct order (not reversed or jumbled)
    expect(content).toContain('abcdefghijklmnop');
  });

  test('Multiple formatting should work together', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]');
    
    await editor.click();
    await editor.type('Multi format text');
    
    await page.keyboard.press('Control+A');
    
    // Apply bold
    await page.locator('button[title="Gras"]').click();
    
    // Apply italic
    await page.locator('button[title="Italique"]').click();
    
    // Apply underline
    await page.locator('button[title="Souligné"]').click();
    
    // Check all formats are applied
    await expect(editor.locator('b, strong')).toBeVisible();
    await expect(editor.locator('i, em')).toBeVisible();
    await expect(editor.locator('u')).toBeVisible();
  });
});
