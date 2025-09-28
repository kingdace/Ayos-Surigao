import { View } from 'react-native';

// Web fallback components
export const MapView = ({ children, style, ...props }: any) => {
  return <View style={style} {...props}>{children}</View>;
};

export const Marker = ({ children, ...props }: any) => {
  return <View {...props}>{children}</View>;
};

export const Region = {};
