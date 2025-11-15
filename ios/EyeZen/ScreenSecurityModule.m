#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>

#import <UIKit/UIKit.h>

@interface ScreenSecurity : NSObject <RCTBridgeModule>
@end

@implementation ScreenSecurity {
  UIView *_shieldView;
  BOOL _isObserving;
}

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (void)dealloc
{
  [self stopObserving];
}

- (void)stopObserving
{
  if (_isObserving) {
    if (@available(iOS 11.0, *)) {
      [[NSNotificationCenter defaultCenter] removeObserver:self
                                                      name:UIScreenCapturedDidChangeNotification
                                                    object:nil];
    }
    _isObserving = NO;
  }
}

- (UIWindow *)currentWindow
{
  UIWindow *window = RCTKeyWindow();
  if (window != nil) {
    return window;
  }

  if (@available(iOS 13.0, *)) {
    for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
      if ([scene isKindOfClass:[UIWindowScene class]] && scene.activationState == UISceneActivationStateForegroundActive) {
        UIWindowScene *windowScene = (UIWindowScene *)scene;
        for (UIWindow *candidate in windowScene.windows) {
          if (candidate.isKeyWindow) {
            return candidate;
          }
        }
      }
    }
  }

  for (UIWindow *candidate in UIApplication.sharedApplication.windows) {
    if (candidate.isKeyWindow) {
      return candidate;
    }
  }

  return nil;
}

- (void)ensureShieldInWindow:(UIWindow *)window
{
  if (_shieldView != nil || window == nil) {
    return;
  }

  _shieldView = [[UIView alloc] initWithFrame:window.bounds];
  _shieldView.backgroundColor = [UIColor blackColor];
  _shieldView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  _shieldView.userInteractionEnabled = NO;
  _shieldView.hidden = YES;
  [window addSubview:_shieldView];
  [window bringSubviewToFront:_shieldView];
}

- (void)updateShieldVisibility
{
  if (!_shieldView) {
    return;
  }

  if (@available(iOS 11.0, *)) {
    BOOL captured = UIScreen.mainScreen.isCaptured;
    _shieldView.hidden = !captured;
  } else {
    _shieldView.hidden = YES;
  }
}

- (void)handleScreenCaptureChange
{
  [self updateShieldVisibility];
}

RCT_EXPORT_METHOD(enable)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIWindow *window = [self currentWindow];
    if (!window) {
      return;
    }

    [self ensureShieldInWindow:window];

    if (@available(iOS 11.0, *)) {
      if (!self->_isObserving) {
        self->_isObserving = YES;
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(handleScreenCaptureChange)
                                                     name:UIScreenCapturedDidChangeNotification
                                                   object:nil];
      }
      [self updateShieldVisibility];
    }
  });
}

RCT_EXPORT_METHOD(disable)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_shieldView removeFromSuperview];
    self->_shieldView = nil;
    [self stopObserving];
  });
}

@end
