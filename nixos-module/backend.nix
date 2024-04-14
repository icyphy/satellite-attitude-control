{ pkgs, config, lib, ... }:
let
  cfg = config.dd-ix.website-content-api;
in
{
  options.lf.backend = with lib; {
    enable = mkOption {
      type = types.bool;
      default = false;
      description = ''the lf backend'';
    };
    user = mkOption {
      type = types.string;
      default = "lf-backend";
    };
    group = mkOption {
      type = types.string;
      default = "lf-backend";
    };
  };

  config = lib.mkIf cfg.enable {
    systemd = {
      services = {
        "lf-backend" = {
          enable = true;
          wantedBy = [ "multi-user.target" ];

          script = ''
            exec ${pkgs.backend}/bin/backend&
          '';

          serviceConfig = {
            Type = "forking";
            User = cfg.user;
            Restart = "always";
          };
        };
      };
    };

    # user accounts for systemd units
    users.users."${cfg.user}" = {
      name = "${cfg.user}";
      description = "";
      isNormalUser = false;
      isSystemUser = true;
      group = cfg.group;
      uid = 1503;
    };
    users.groups."${cfg.group}" = { };
  };
}
