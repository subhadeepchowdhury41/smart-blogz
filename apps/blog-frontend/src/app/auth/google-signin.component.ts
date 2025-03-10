import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-google-signin',
  template: `
    <div
      id="g_id_onload"
      [attr.data-client_id]="googleClientId"
      data-context="signin"
      data-ux_mode="popup"
      data-callback="handleGoogleResponse"
      data-auto_prompt="false">
    </div>
    <div
      class="g_id_signin"
      data-type="standard"
      data-shape="rectangular"
      data-theme="outline"
      data-text="signin_with"
      data-size="large"
      data-logo_alignment="left">
    </div>
  `,
  standalone: true
})
export class GoogleSigninComponent implements OnInit {
  googleClientId = environment.googleClientId;
  ngOnInit() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
  handleGoogleResponse(response: any) {
    console.log('Google response:', response);
  }
}
