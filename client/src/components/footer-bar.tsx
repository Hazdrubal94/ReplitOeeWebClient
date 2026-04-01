import { LogOut } from "lucide-react";

export function FooterBar() {
  const user = {
    name: "Jan Kowalski",
    email: "jan.kowalski@company.local"
  };

  const handleLogout = () => {
    console.log("logout"); // TODO: podpiąć backend
  };

  return (
    <div className="h-8 flex items-center justify-between px-4 border-t border-border bg-background text-xs text-muted-foreground flex-shrink-0">
      
      {/* LEFT - API */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400"></div>
        <span>API: https://localhost:8443</span>
      </div>

      {/* RIGHT - USER + LOGOUT */}
      <div className="flex items-center gap-3">
        
        {/* USER */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-medium text-accent-foreground">
            {user.name[0]}
          </div>
          <span className="truncate max-w-[160px]">
            {user.name}
          </span>
        </div>

        {/* SEPARATOR */}
        <div className="h-4 w-px bg-border" />

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}