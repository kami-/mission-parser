class AK103 {
    class Rifleman {
        weapons[] = {"ACE_AK103"};
        magazines[] = {
            {"30Rnd_762x39_AK47", 9},
            {"HandGrenade_East", 2},
            {"SmokeShell", 1}
        };
        ruck = "ACE_Rucksack_EAST";
        ruckWeapons[] = {};
        ruckMagazines[] = {
            {"30Rnd_762x39_AK47", 6},
            {"HandGrenade_East", 1},
            {"SmokeShell", 1}
        };
        items[] = {"ACRE_PRC343"};
        ifak[] = {1, 1, 1};
        code = "";
    };

    class Leader : Rifleman {
        weapons[] = {"ACE_AK103_GL"};
        magazines[] = {
            {"30Rnd_762x39_AK47", 6},
            {"ACE_30Rnd_762x39_T_AK47", 3},
            {"HandGrenade_East", 1},
            {"SmokeShell", 2},
            {"1Rnd_HE_GP25", 4},
            {"1Rnd_SMOKE_GP25", 2},
            {"1Rnd_SmokeRed_GP25", 1},
            {"1Rnd_SmokeGreen_GP25", 1}
        };
        ruckMagazines[] = {
            {"30Rnd_762x39_AK47", /*fsdfsd*/3},
            {"ACE_30Rnd_762x39_T_AK47", 3},
            {"HandGrenade_East", 1},
            {"SmokeShell", 1},
            {"1Rnd_SMOKE_GP25", 2},
            {"1Rnd_SmokeRed_GP25", 1},
            {"1Rnd_SmokeGreen_GP25", 1}
        };
        items[] = {"ACRE_PRC343", "Binocular"};
    };

    class CO : Officer {
    };

    class XO : Officer {
    };

    class SL : Officer {
    };
};
/****/ /**/
