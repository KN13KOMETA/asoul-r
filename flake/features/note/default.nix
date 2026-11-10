_: {
  perSystem = {pkgs, ...}: {
    packages.note = pkgs.writeShellApplication {
      name = "note";
      runtimeInputs = [pkgs.ripgrep pkgs.gawk];
      bashOptions = ["errexit" "pipefail"];
      text = ''
        if [ -z "$1" ]; then
          echo 'Usage: note <word> - show all comments of the form "word: ..."' >&2
          exit 1
        fi

        rg -nH --hidden --no-ignore --ignore-file .noteignore "$1:" |
          awk -f ${./print_comments.awk}
      '';
    };
  };
}
