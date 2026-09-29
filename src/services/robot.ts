export type RobotCommand = 'MOVE_FORWARD' | 'MOVE_BACKWARD' | 'TURN_LEFT' | 'TURN_RIGHT' | 'STOP' | 'NECK_LEFT' | 'NECK_RIGHT' | 'NECK_CENTER' | 'HEAD_UP' | 'HEAD_DOWN' | 'WINGS_OPEN' | 'WINGS_CLOSE' | 'PROJECT_WING' | 'PROJECT_FLOOR' | 'AUDIO_PLAY' | 'AUDIO_PAUSE' | 'AUDIO_STOP';

export async function sendRobotCommand(command: RobotCommand): Promise<{ ok: boolean; demo: boolean; command: RobotCommand }> {
  await new Promise((resolve) => window.setTimeout(resolve, 280));
  return { ok: true, demo: true, command };
}
