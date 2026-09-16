/* Canonical flight-action crosswalk: ED <-> SC <-> NMS.
 * Each row: one thing a pilot wants to memorize ONCE (e.g. "Boost").
 * ed/sc: game action names read/written by the parsers/generators.
 * nms: {set, action} pairs for TKGAMESETTINGS.MXML.
 * conf: exact = same concept in all games, approx = closest equivalent, gap = no counterpart.
 */
window.CANONICAL_ACTIONS = [
  // ---- Flight rotation ----
  { id:"pitch_up", label:"Pitch Up", cat:"Flight", conf:"exact", ed:["PitchUpButton"], sc:[["spaceship_movement","v_pitch_up"],["spaceship_movement","v_decoupled_pitch_up"]], nms:[["Ship","Ship_PitchUp"]] },
  { id:"pitch_down", label:"Pitch Down", cat:"Flight", conf:"exact", ed:["PitchDownButton"], sc:[["spaceship_movement","v_pitch_down"],["spaceship_movement","v_decoupled_pitch_down"]], nms:[["Ship","Ship_PitchDown"]] },
  { id:"yaw_left", label:"Yaw Left", cat:"Flight", conf:"exact", ed:["YawLeftButton"], sc:[["spaceship_movement","v_yaw_left"],["spaceship_movement","v_decoupled_yaw_left"]], nms:[["Ship","Ship_YawLeft"]] },
  { id:"yaw_right", label:"Yaw Right", cat:"Flight", conf:"exact", ed:["YawRightButton"], sc:[["spaceship_movement","v_yaw_right"],["spaceship_movement","v_decoupled_yaw_right"]], nms:[["Ship","Ship_YawRight"]] },
  { id:"roll_left", label:"Roll Left", cat:"Flight", conf:"exact", ed:["RollLeftButton"], sc:[["spaceship_movement","v_roll_left"],["spaceship_movement","v_decoupled_roll_left"]], nms:[["Ship","Ship_RollLeft"]] },
  { id:"roll_right", label:"Roll Right", cat:"Flight", conf:"exact", ed:["RollRightButton"], sc:[["spaceship_movement","v_roll_right"],["spaceship_movement","v_decoupled_roll_right"]], nms:[["Ship","Ship_RollRight"]] },
  // ---- Thrust / strafe ----
  { id:"thrust_fwd", label:"Thrust Forward", cat:"Thrust", conf:"exact", ed:["ForwardThrustButton"], sc:[["spaceship_movement","v_strafe_forward"],["spaceship_movement","v_decoupled_strafe_forward"],["spaceship_movement","v_throttle_up"]], nms:[["Ship","Ship_Forward"]] },
  { id:"thrust_back", label:"Thrust Backward", cat:"Thrust", conf:"exact", ed:["BackwardThrustButton"], sc:[["spaceship_movement","v_strafe_back"],["spaceship_movement","v_decoupled_strafe_back"],["spaceship_movement","v_throttle_down"]], nms:[["Ship","Ship_Reverse"]] },
  { id:"strafe_left", label:"Strafe Left", cat:"Thrust", conf:"exact", ed:["LeftThrustButton"], sc:[["spaceship_movement","v_strafe_left"],["spaceship_movement","v_decoupled_strafe_left"]], nms:[["Ship","Ship_Left"]] },
  { id:"strafe_right", label:"Strafe Right", cat:"Thrust", conf:"exact", ed:["RightThrustButton"], sc:[["spaceship_movement","v_strafe_right"],["spaceship_movement","v_decoupled_strafe_right"]], nms:[["Ship","Ship_Right"]] },
  { id:"strafe_up", label:"Strafe Up", cat:"Thrust", conf:"exact", ed:["UpThrustButton"], sc:[["spaceship_movement","v_strafe_up"],["spaceship_movement","v_decoupled_strafe_up"]], nms:[["Ship","Ship_Up"]] },
  { id:"strafe_down", label:"Strafe Down", cat:"Thrust", conf:"exact", ed:["DownThrustButton"], sc:[["spaceship_movement","v_strafe_down"],["spaceship_movement","v_decoupled_strafe_down"]], nms:[["Ship","Ship_Down"]] },
  // ---- Speed ----
  { id:"throttle_zero", label:"Throttle Zero / Brake", cat:"Speed", conf:"approx", note:"ED SetSpeedZero; SC brake key; NMS brake", ed:["SetSpeedZero"], sc:[["spaceship_movement","v_brake"],["spaceship_movement","v_decoupled_brake"],["spaceship_movement","v_throttle_zero"]], nms:[["Ship","Ship_Brake"]] },
  { id:"throttle_100", label:"Throttle 100%", cat:"Speed", conf:"approx", ed:["SetSpeed100"], sc:[["spaceship_movement","v_throttle_100"]], nms:[["Ship","Ship_Boost"]] },
  { id:"boost", label:"Boost / Afterburner", cat:"Speed", conf:"exact", ed:["UseBoostJuice"], sc:[["spaceship_movement","v_boost"],["spaceship_movement","v_afterburner"]], nms:[["Ship","Ship_Boost"]] },
  { id:"flight_assist", label:"Flight Assist / Decoupled", cat:"Speed", conf:"exact", note:"ED assist OFF = SC decoupled ON", ed:["ToggleFlightAssist"], sc:[["spaceship_movement","v_ifcs_toggle_vector_decoupling"]], nms:[["Ship","Ship_Pulse"]] },
  // ---- Weapons ----
  { id:"fire_primary", label:"Fire Primary", cat:"Weapons", conf:"exact", ed:["PrimaryFire"], sc:[["spaceship_weapons","v_attack1"]], nms:[["Ship","Ship_Fire"]] },
  { id:"fire_secondary", label:"Fire Secondary / Missile", cat:"Weapons", conf:"exact", ed:["SecondaryFire"], sc:[["spaceship_weapons","v_attack2"]], nms:[["Ship","Ship_FireSecondary"]] },
  { id:"hardpoints", label:"Deploy Hardpoints", cat:"Weapons", conf:"approx", note:"SC has no deploy toggle; mapped to gimbal lock", ed:["DeployHardpoints"], sc:[["spaceship_targeting","v_toggle_weapon_gimbal_lock"]], nms:[["Ship","Ship_Weapons"]] },
  { id:"firegroup", label:"Cycle Fire Group", cat:"Weapons", conf:"approx", note:"SC: reticle mode as closest", ed:["CycleFireGroupNext"], sc:[["spaceship_targeting","v_target_cycle_reticle_mode"]], nms:[["Ship","Ship_WeaponChange"]] },
  { id:"countermeasure", label:"Countermeasure / Flare", cat:"Weapons", conf:"exact", ed:["DeployCounterMeasure"], sc:[["spaceship_defensive","v_countermeasure"]], nms:[["Ship","Ship_Flare"]] },
  // ---- Targeting ----
  { id:"target_ahead", label:"Target Ahead / Reticle Focus", cat:"Targeting", conf:"exact", ed:["SelectTarget"], sc:[["spaceship_targeting","v_target_reticle_focus"]], nms:[["Ship","Ship_TargetLock"]] },
  { id:"target_next", label:"Cycle Target Next", cat:"Targeting", conf:"exact", ed:["CycleNextTarget"], sc:[["spaceship_targeting","v_target_cycle_all_fwd"]], nms:[["Ship","Ship_TargetNext"]] },
  { id:"target_prev", label:"Cycle Target Previous", cat:"Targeting", conf:"exact", ed:["CyclePreviousTarget"], sc:[["spaceship_targeting","v_target_cycle_all_back"]], nms:[["Ship","Ship_TargetPrev"]] },
  { id:"target_hostile", label:"Nearest Hostile", cat:"Targeting", conf:"exact", ed:["CycleNextHostileTarget"], sc:[["spaceship_targeting","v_target_nearest_hostile"],["spaceship_targeting","v_target_cycle_hostile_fwd"]], nms:[["Ship","Ship_TargetHostile"]] },
  { id:"target_pinned", label:"Cycle Pinned Target", cat:"Targeting", conf:"approx", note:"ED has no pins; closest is next target", ed:["CycleNextTarget"], sc:[["spaceship_targeting","v_target_cycle_pinned_fwd"]], nms:[["Ship","Ship_TargetNext"]] },
  // ---- Systems ----
  { id:"landing_gear", label:"Landing Gear", cat:"Systems", conf:"exact", ed:["LandingGearToggle"], sc:[["spaceship_movement","v_toggle_landing_system"],["spaceship_movement","v_autoland"]], nms:[["Ship","Ship_Land"]] },
  { id:"cargo_scoop", label:"Cargo Scoop", cat:"Systems", conf:"approx", note:"SC: cargo lock; NMS: land/beam approx", ed:["ToggleCargoScoop"], sc:[["spaceship_general","v_doors_open_all"]], nms:[["Ship","Ship_Land"]] },
  { id:"lights", label:"Ship Lights", cat:"Systems", conf:"approx", ed:["ShipSpotLightToggle"], sc:[["spaceship_general","v_toggle_lights"]], nms:[["Ship","Ship_Lights"]] },
  { id:"silent", label:"Silent Running", cat:"Systems", conf:"approx", note:"SC: G-force safety as closest stealth-ish toggle", ed:["ToggleSilentRunning"], sc:[["spaceship_movement","v_ifcs_toggle_gforce_safety"]], nms:[["Ship","Ship_Cloak"]] },
  { id:"eject", label:"Eject Cargo", cat:"Systems", conf:"approx", ed:["EjectAllCargo"], sc:[["spaceship_general","v_self_destruct"]], nms:[["Ship","Ship_DropCargo"]] },
  { id:"power_reset", label:"Reset Power Distribution", cat:"Systems", conf:"approx", ed:["ResetPowerDistribution"], sc:[["spaceship_power","v_power_reset"]], nms:[["Ship","Ship_Recharge"]] },
  // ---- Nav ----
  { id:"ftl1", label:"Supercruise / Quantum / Pulse", cat:"Nav", conf:"exact", note:"Main FTL cruise in each game", ed:["Supercruise"], sc:[["spaceship_movement","v_toggle_qdrive_engagement"]], nms:[["Ship","Ship_Pulse"]] },
  { id:"ftl2", label:"Hyperspace Jump", cat:"Nav", conf:"approx", note:"NMS has no 2nd FTL; reuse Pulse", ed:["Hyperspace"], sc:[["spaceship_movement","v_toggle_qdrive_engagement"]], nms:[["Ship","Ship_Pulse"]] },
  { id:"map_galaxy", label:"Galaxy / Star Map", cat:"Nav", conf:"exact", ed:["GalaxyMapOpen"], sc:[["spaceship_general","v_toggle_starmap"]], nms:[["Frontend","UI_GalaxyMap"]] },
  { id:"map_system", label:"System Map", cat:"Nav", conf:"approx", ed:["SystemMapOpen"], sc:[["spaceship_general","v_toggle_starmap"]], nms:[["Frontend","UI_GalaxyMap"]] },
  // ---- View / UI ----
  { id:"headlook", label:"Headlook / Freelook", cat:"View/UI", conf:"exact", ed:["HeadLookToggle"], sc:[["spaceship_view","v_view_freelook_mode"]], nms:[["Ship","Ship_LookBehind"]] },
  { id:"zoom_in", label:"Zoom In", cat:"View/UI", conf:"exact", ed:["CamZoomIn"], sc:[["spaceship_view","v_view_zoom_in"]], nms:[["Ship","Ship_ZoomIn"]] },
  { id:"zoom_out", label:"Zoom Out", cat:"View/UI", conf:"exact", ed:["CamZoomOut"], sc:[["spaceship_view","v_view_zoom_out"]], nms:[["Ship","Ship_ZoomOut"]] },
  { id:"ui_left", label:"UI Focus Left", cat:"View/UI", conf:"approx", ed:["FocusLeftPanel"], sc:[["spaceship_general","v_mfd_left"]], nms:[["Frontend","UI_Left"]] },
  { id:"ui_right", label:"UI Focus Right", cat:"View/UI", conf:"approx", ed:["FocusRightPanel"], sc:[["spaceship_general","v_mfd_right"]], nms:[["Frontend","UI_Right"]] },
  { id:"ui_comms", label:"Comms Panel", cat:"View/UI", conf:"approx", ed:["FocusCommsPanel"], sc:[["spaceship_general","v_comms"]], nms:[["Frontend","UI_Up"]] },
  { id:"ui_radar", label:"Radar / Sensor Focus", cat:"View/UI", conf:"approx", ed:["FocusRadarPanel"], sc:[["spaceship_targeting","scan_toggle_mode"]], nms:[["Ship","Ship_Scan"]] }
];

/* Built-in default layout ("Reference HOTAS") used when the user has no file yet.
 * Values are canonical input objects: {kind, code, mod, joy, label}
 * kind: key | mouse | joybtn | joyaxis | joyhat | unbound
 */
window.DEFAULT_LAYOUT = {
  pitch_up:{kind:"joyaxis",code:"Y",joy:1,label:"Stick Y"}, pitch_down:{kind:"joyaxis",code:"Y",joy:1,label:"Stick Y"},
  yaw_left:{kind:"joyaxis",code:"RZ",joy:1,label:"Stick Twist"}, yaw_right:{kind:"joyaxis",code:"RZ",joy:1,label:"Stick Twist"},
  roll_left:{kind:"joyaxis",code:"X",joy:1,label:"Stick X"}, roll_right:{kind:"joyaxis",code:"X",joy:1,label:"Stick X"},
  thrust_fwd:{kind:"key",code:"W",label:"W"}, thrust_back:{kind:"key",code:"S",label:"S"},
  strafe_left:{kind:"key",code:"A",label:"A"}, strafe_right:{kind:"key",code:"D",label:"D"},
  strafe_up:{kind:"key",code:"Space",label:"Space"}, strafe_down:{kind:"key",code:"LCtrl",label:"LCtrl"},
  throttle_zero:{kind:"key",code:"X",label:"X"}, throttle_100:{kind:"key",code:"C",label:"C"},
  boost:{kind:"key",code:"Tab",label:"Tab"}, flight_assist:{kind:"key",code:"Z",label:"Z"},
  fire_primary:{kind:"joybtn",code:"1",joy:1,label:"Joy 1 · Btn 1"}, fire_secondary:{kind:"joybtn",code:"2",joy:1,label:"Joy 1 · Btn 2"},
  hardpoints:{kind:"key",code:"U",label:"U"}, firegroup:{kind:"key",code:"N",label:"N"},
  countermeasure:{kind:"key",code:"G",label:"G"},
  target_ahead:{kind:"key",code:"T",label:"T"}, target_next:{kind:"key",code:"H",label:"H"},
  target_prev:{kind:"key",code:"G",mod:"LShift",label:"Shift+G"}, target_hostile:{kind:"key",code:"T",mod:"LAlt",label:"Alt+T"},
  target_pinned:{kind:"unbound",label:"—"},
  landing_gear:{kind:"key",code:"L",label:"L"}, cargo_scoop:{kind:"key",code:"B",label:"B"},
  lights:{kind:"key",code:"I",label:"I"}, silent:{kind:"key",code:"Delete",label:"Del"},
  eject:{kind:"key",code:"End",label:"End"}, power_reset:{kind:"key",code:"P",label:"P"},
  ftl1:{kind:"key",code:"J",label:"J"}, ftl2:{kind:"key",code:"K",label:"K"},
  map_galaxy:{kind:"key",code:"M",label:"M"}, map_system:{kind:"key",code:"O",label:"O"},
  headlook:{kind:"mouse",code:"Middle",label:"Mouse Middle"}, zoom_in:{kind:"mouse",code:"WheelUp",label:"Wheel Up"},
  zoom_out:{kind:"mouse",code:"WheelDown",label:"Wheel Dn"},
  ui_left:{kind:"key",code:"F1",label:"F1"}, ui_right:{kind:"key",code:"F4",label:"F4"},
  ui_comms:{kind:"key",code:"F2",label:"F2"}, ui_radar:{kind:"key",code:"F3",label:"F3"}
};
