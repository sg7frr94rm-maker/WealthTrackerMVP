import { Authenticator } from "@aws-amplify/ui-react";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#10b981,transparent_35%),radial-gradient(circle_at_bottom_right,#3b82f6,transparent_35%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white">
            Investment Wealth Tracker
          </h1>

          <p className="mt-3 text-slate-400">
            Track ETFs, mutual funds, returns, allocation, dividends and long-term wealth progress.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl backdrop-blur">
          {children}
        </div>

      </div>
    </div>
  );
}

export default AuthLayout;