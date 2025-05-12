import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '', errorStack: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || '', errorStack: error?.stack || '' };
  }

  componentDidCatch(error, errorInfo) {
    // Report to logging/analytics here if needed
    if (__DEV__) {
      console.error('Uncaught error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '', errorStack: '' });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.boundary}>
          <Text style={styles.header}>Something went wrong</Text>
          {__DEV__ && (
            <>
              <Text style={styles.error}>{this.state.errorMessage}</Text>
              <Text style={styles.stack}>{this.state.errorStack}</Text>
            </>
          )}
          <Button title="Try again" onPress={this.handleReset} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  boundary: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4834d4',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginVertical: 8,
  },
  stack: {
    color: '#888',
    fontSize: 12,
    marginBottom: 16,
  },
});
