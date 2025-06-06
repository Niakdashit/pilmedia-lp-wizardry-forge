import { useQuickCampaignStore } from '../quickCampaignStore';

describe('generatePreviewCampaign', () => {
  afterEach(() => {
    // reset store to default state after each test
    useQuickCampaignStore.getState().reset();
  });

  it('creates roulette segments matching segmentCount when type is wheel', () => {
    const store = useQuickCampaignStore.getState();
    store.setSelectedGameType('wheel');
    store.setSegmentCount(6);

    const preview = store.generatePreviewCampaign();

    expect(preview.config.roulette.segments).toHaveLength(6);
  });

  it('includes jackpot colors in generated config when type is jackpot', () => {
    const store = useQuickCampaignStore.getState();
    store.setSelectedGameType('jackpot');

    const colors = {
      containerBackgroundColor: '#111111',
      backgroundColor: '#222222',
      borderColor: '#333333',
      borderWidth: 5,
      slotBorderColor: '#444444',
      slotBorderWidth: 3,
      slotBackgroundColor: '#555555'
    };

    store.setJackpotColors(colors);

    const preview = store.generatePreviewCampaign();

    expect(preview.gameConfig.jackpot).toMatchObject(colors);
  });
});
