import { useState } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyDisclaimer({ onAccept }) {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="max-w-lg w-full rounded-t-2xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Privacy & Data Agreement</h2>
            <p className="text-xs text-muted-foreground">Required before accessing XPS Intelligence</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="rounded-lg bg-secondary/50 p-4 text-sm text-foreground/80 max-h-48 overflow-y-auto">
            <p className="mb-2"><strong>Privacy Policy Summary:</strong></p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li>Your data is stored securely on our platform.</li>
              <li>We use industry-standard encryption and security measures.</li>
              <li>Your account data, leads, and business intelligence remain associated with your account.</li>
              <li>We may use anonymized data to improve our AI models and services.</li>
              <li>You can request data deletion by contacting support.</li>
              <li>By using this platform, you agree to our terms of service.</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-2 -m-2 rounded-lg active:bg-white/5">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={e => setPrivacyAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 min-w-[20px] rounded accent-primary"
            />
            <span className="text-[13px] sm:text-sm leading-relaxed">
              I accept the <strong>Privacy Policy</strong> and <strong>Terms of Service</strong>. I understand that data accumulated on this platform is retained by XPS Intelligence.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-2 -m-2 rounded-lg active:bg-white/5">
            <input
              type="checkbox"
              checked={dataConsent}
              onChange={e => setDataConsent(e.target.checked)}
              className="mt-1 w-5 h-5 min-w-[20px] rounded accent-primary"
            />
            <span className="text-[13px] sm:text-sm leading-relaxed">
              I consent to XPS Intelligence using my data to <strong>train and improve AI models</strong>. (Opting out limits access to basic tools only, with no data download or export.)
            </span>
          </label>

          {!dataConsent && privacyAccepted && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-200">
                Without data sharing consent, you'll only have access to basic tools. You will not be able to download or export data.
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={() => onAccept(privacyAccepted, dataConsent)}
          disabled={!privacyAccepted}
          className="w-full"
        >
          {privacyAccepted ? "Continue to XPS Intelligence" : "Accept Privacy Policy to Continue"}
        </Button>
      </div>
    </div>
  );
}