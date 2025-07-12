import { Snackbar as SnackBarPaper } from "react-native-paper";

const Snackbar = ({ text, visible, onDismiss, duration = 3000 }) => {
  return (
    <SnackBarPaper visible={visible} onDismiss={onDismiss} duration={duration}>
      {text}
    </SnackBarPaper>
  );
};

export default Snackbar;
