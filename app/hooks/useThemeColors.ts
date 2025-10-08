import { useColorScheme } from 'react-native';
import { Light, Dark } from '../constants/Colors';


export default function useThemeColors() {
  const scheme = useColorScheme(); // 'light' | 'dark' | null
  return scheme === 'dark' ? Dark : Light;
}
