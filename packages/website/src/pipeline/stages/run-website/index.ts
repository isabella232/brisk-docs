import createStage from '../make-pipline-stage';

interface StageInput {}

// Boilerplate, uncomment when used
// interface StageConfig {}

interface StageOutput {}

export default createStage(
  'run-website',
  async (input: StageInput): Promise<StageOutput> => {
    return input;
  },
);
