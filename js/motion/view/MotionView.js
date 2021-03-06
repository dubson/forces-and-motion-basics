// Copyright 2002-2013, University of Colorado Boulder

/**
 * Main scenery view for the Motion, Friction and Acceleration screens.
 */
define( function( require ) {
  'use strict';

  var MotionConstants = require( 'FORCES_AND_MOTION_BASICS/motion/MotionConstants' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var ItemNode = require( 'FORCES_AND_MOTION_BASICS/motion/view/ItemNode' );
  var WaterBucketNode = require( 'FORCES_AND_MOTION_BASICS/motion/view/WaterBucketNode' );
  var PusherNode = require( 'FORCES_AND_MOTION_BASICS/motion/view/PusherNode' );
  var HSlider = require( 'FORCES_AND_MOTION_BASICS/motion/view/HSlider' );
  var Strings = require( 'FORCES_AND_MOTION_BASICS/forces-and-motion-basics-strings' );
  var SpeedometerNode = require( 'SCENERY_PHET/SpeedometerNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MotionControlPanel = require( 'FORCES_AND_MOTION_BASICS/motion/view/MotionControlPanel' );
  var MovingBackgroundNode = require( 'FORCES_AND_MOTION_BASICS/motion/view/MovingBackgroundNode' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ReadoutArrow = require( 'FORCES_AND_MOTION_BASICS/common/view/ReadoutArrow' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var AccelerometerNode = require( 'FORCES_AND_MOTION_BASICS/motion/view/AccelerometerNode' );
  var Property = require( 'AXON/Property' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var ArrowButton = require( 'SCENERY_PHET/ArrowButton' );
  var skateboardImage = require( 'image!FORCES_AND_MOTION_BASICS/../images/skateboard.png' );

  /**
   * Constructor for the MotionView
   * @param {MotionModel} model model for the entire screen
   * @constructor
   */
  function MotionView( model ) {

    //Constants and fields
    this.model = model;

    //Call super constructor
    ScreenView.call( this, {renderer: 'svg'} );

    //Variables for this constructor, for convenience
    var motionView = this;
    var width = this.layoutBounds.width;
    var height = this.layoutBounds.height;

    //Constants
    var skyHeight = 362;
    var groundHeight = height - skyHeight;

    //Create the static background
    var skyGradient = new LinearGradient( 0, 0, 0, skyHeight ).addColorStop( 0, '#02ace4' ).addColorStop( 1, '#cfecfc' );
    this.sky = new Rectangle( -width, -skyHeight, width * 3, skyHeight * 2, {fill: skyGradient, pickable: false} );

    this.groundNode = new Rectangle( -width, skyHeight, width * 3, groundHeight * 2, {fill: '#c59a5b', pickable: false} );
    this.addChild( this.sky );
    this.addChild( this.groundNode );

    //Create the dynamic (moving) background
    this.addChild( new MovingBackgroundNode( model, this.layoutBounds.width / 2 ).mutate( { layerSplit: true } ) );

    //Add toolbox backgrounds for the objects
    var boxHeight = 180;
    this.addChild( new Rectangle( 10, height - boxHeight - 10, 300, boxHeight, 10, 10, {fill: '#e7e8e9', stroke: '#000000', lineWidth: 1, pickable: false} ) );
    this.addChild( new Rectangle( width - 10 - 300, height - boxHeight - 10, 300, boxHeight, 10, 10, { fill: '#e7e8e9', stroke: '#000000', lineWidth: 1, pickable: false} ) );

    //Add the pusher
    this.addChild( new PusherNode( model, this.layoutBounds.width ) );

    //Add the skateboard if on the 'motion' screen
    if ( model.skateboard ) {
      this.addChild( new Image( skateboardImage, {centerX: width / 2, y: 315 + 12, pickable: false} ) );
    }

    //Create the slider
    var disableText = function( node ) { return function( length ) {node.fill = length === 0 ? 'gray' : 'black';}; };
    var disableLeftProperty = new DerivedProperty( [model.fallenProperty, model.fallenDirectionProperty], function( fallen, fallenDirection ) {
      return fallen && fallenDirection === 'left';
    } );
    var disableRightProperty = new DerivedProperty( [model.fallenProperty, model.fallenDirectionProperty], function( fallen, fallenDirection ) {
      return fallen && fallenDirection === 'right';
    } );
    var sliderLabel = new Text( Strings.appliedForce, {font: new PhetFont( 22 ), centerX: width / 2, y: 430} );
    var slider = new HSlider( -500, 500, 300, model.appliedForceProperty, model.speedClassificationProperty, disableLeftProperty, disableRightProperty, {zeroOnRelease: true, centerX: width / 2 + 1, y: 535} ).addNormalTicks();

    this.addChild( sliderLabel );
    this.addChild( slider );

    //Position the units to the right of the text box.
    var readout = new Text( '???', {font: new PhetFont( 22 ), pickable: false} );
    readout.bottom = slider.top - 15;
    model.appliedForceProperty.link( function( appliedForce ) {
      readout.text = appliedForce.toFixed( 0 ) + ' ' + Strings.newtons; //TODO: i18n message format
      readout.centerX = width / 2;
    } );

    //Make 'Newtons Readout' stand out but not look like a text entry field
    this.textPanelNode = new Rectangle( 0, 0, readout.right - readout.left + 50, readout.height + 4, {fill: 'white', stroke: 'lightGray', centerX: width / 2, top: readout.y - readout.height + 2, pickable: false} );
    this.addChild( this.textPanelNode );
    this.addChild( readout );

    //Show left arrow button 'tweaker' to change the applied force in increments of 50
    var leftArrowButton = new ArrowButton( 'left', function() {
      model.appliedForce = Math.max( model.appliedForce - 50, -500 );
    }, {rectangleYMargin: 7, rectangleXMargin: 10, right: this.textPanelNode.left - 6, centerY: this.textPanelNode.centerY} );

    //Do not allow the user to apply a force that would take the object beyond its maximum velocity
    model.multilink( ['appliedForce', 'speedClassification', 'stackSize'], function( appliedForce, speedClassification, stackSize ) {leftArrowButton.setEnabled( stackSize > 0 && (speedClassification === 'LEFT_SPEED_EXCEEDED' ? false : appliedForce > -500 ) );} );
    this.addChild( leftArrowButton );

    //Show right arrow button 'tweaker' to change the applied force in increments of 50
    var rightArrowButton = new ArrowButton( 'right', function() {
      model.appliedForce = Math.min( model.appliedForce + 50, 500 );
    }, {rectangleYMargin: 7, rectangleXMargin: 10, left: this.textPanelNode.right + 6, centerY: this.textPanelNode.centerY} );

    //Do not allow the user to apply a force that would take the object beyond its maximum velocity
    model.multilink( ['appliedForce', 'speedClassification', 'stackSize'], function( appliedForce, speedClassification, stackSize ) { rightArrowButton.setEnabled( stackSize > 0 && (speedClassification === 'RIGHT_SPEED_EXCEEDED' ? false : appliedForce < 500 ) ); } );
    this.addChild( rightArrowButton );

    model.stack.lengthProperty.link( disableText( sliderLabel ) );
    model.stack.lengthProperty.link( disableText( readout ) );
    model.stack.lengthProperty.link( function( length ) { slider.enabled = length > 0; } );

    //Create the speedometer.  Specify the location after construction so we can set the 'top'
    var speedometerNode = new SpeedometerNode( model.velocityProperty, Strings.speed, MotionConstants.MAX_SPEED ).mutate( {x: width / 2, top: 2} );
    model.showSpeedProperty.linkAttribute( speedometerNode, 'visible' );

    //Move away from the stack if the stack getting too high.  No need to record this in the model since it will always be caused deterministically by the model.
    //Use Tween.JS to smoothly animate
    var itemsCentered = new Property( true );
    model.stack.lengthProperty.link( function() {

      //Move both the accelerometer and speedometer if the stack is getting too high, based on the height of items in the stack
      var stackHeightThreshold = 160;
      if ( motionView.stackHeight > stackHeightThreshold && itemsCentered.value ) {
        itemsCentered.value = false;
        new TWEEN.Tween( speedometerNode ).to( { centerX: 300}, 400 ).easing( TWEEN.Easing.Cubic.InOut ).start();
        if ( accelerometerNode ) {
          new TWEEN.Tween( accelerometerWithTickLabels ).to( { centerX: 300}, 400 ).easing( TWEEN.Easing.Cubic.InOut ).start();
        }
      }
      else if ( motionView.stackHeight <= stackHeightThreshold && !itemsCentered.value ) {
        itemsCentered.value = true;

        new TWEEN.Tween( speedometerNode ).to( { x: width / 2}, 400 ).easing( TWEEN.Easing.Cubic.InOut ).start();
        if ( accelerometerNode ) {
          new TWEEN.Tween( accelerometerWithTickLabels ).to( { centerX: width / 2}, 400 ).easing( TWEEN.Easing.Cubic.InOut ).start();
        }
      }
    } );
    this.addChild( speedometerNode );

    //Create and add the control panel
    var controlPanel = new MotionControlPanel( model );
    this.addChild( controlPanel );

    //Reset all button goes beneath the control panel
    var resetButton = new ResetAllButton( model.reset.bind( model ), {scale: 88 / 103} ).mutate( {centerX: controlPanel.centerX, top: controlPanel.bottom + 5} );
    this.addChild( resetButton );

    //Add the accelerometer, if on the final screen
    if ( model.accelerometer ) {

      var accelerometerNode = new AccelerometerNode( model.accelerationProperty );
      var labelAndAccelerometer = new VBox( {pickable: false, children: [new Text( 'Acceleration', {font: new PhetFont( 18 )} ), accelerometerNode]} );
      var tickLabel = function( label, tick ) {
        return new Text( label, {pickable: false, font: new PhetFont( 16 ), centerX: tick.centerX, top: tick.bottom + 27} );
      };
      var accelerometerWithTickLabels = new Node( {children: [labelAndAccelerometer, tickLabel( '-20', accelerometerNode.ticks[0] ),
        tickLabel( '0', accelerometerNode.ticks[2] ),
        tickLabel( '20', accelerometerNode.ticks[4] )], centerX: width / 2, y: 135, pickable: false} );
      model.showAccelerationProperty.linkAttribute( accelerometerWithTickLabels, 'visible' );

      this.addChild( accelerometerWithTickLabels );
    }

    //Iterate over the items in the model and create and add nodes for each one
    this.itemNodes = [];
    for ( var i = 0; i < model.items.length; i++ ) {
      var item = model.items[i];
      var Constructor = item.bucket ? WaterBucketNode : ItemNode;
      var itemNode = new Constructor( model, motionView, item,
        item.image,
        item.sittingImage || item.image,
        item.holdingImage || item.image,
        model.showMassesProperty );
      this.itemNodes.push( itemNode );

      //Provide a reference from the item model to its view so that view dimensions can be looked up easily
      item.view = itemNode;
      this.addChild( itemNode );
    }

    //Add the force arrows & associated readouts in front of the items
    var arrowScale = 0.3;
    this.sumArrow = new ReadoutArrow( Strings.sumOfForces, '#96c83c', this.layoutBounds.width / 2, 230, model.sumOfForcesProperty, model.showValuesProperty, {labelPosition: 'top', arrowScale: arrowScale} );
    model.multilink( ['showForce', 'showSumOfForces'], function( showForce, showSumOfForces ) {motionView.sumArrow.visible = showForce && showSumOfForces;} );
    this.sumOfForcesText = new Text( Strings.sumOfForcesEqualsZero, {pickable: false, font: new PhetFont( { size: 16, weight: 'bold' } ), centerX: width / 2, y: 200} );
    model.multilink( ['showForce', 'showSumOfForces', 'sumOfForces'], function( showForce, showSumOfForces, sumOfForces ) {motionView.sumOfForcesText.visible = showForce && showSumOfForces && !sumOfForces;} );
    this.appliedForceArrow = new ReadoutArrow( Strings.appliedForce, '#e66e23', this.layoutBounds.width / 2, 280, model.appliedForceProperty, model.showValuesProperty, {labelPosition: 'side', arrowScale: arrowScale} );
    this.frictionArrow = new ReadoutArrow( Strings.friction, '#e66e23', this.layoutBounds.width / 2, 280, model.frictionForceProperty, model.showValuesProperty, {labelPosition: 'side', arrowScale: arrowScale} );
    this.addChild( this.sumArrow );
    this.addChild( this.appliedForceArrow );
    this.addChild( this.frictionArrow );
    this.addChild( this.sumOfForcesText );

    //On the motion screens, when the 'Friction' label overlaps the force vector it should be displaced vertically
    model.multilink( ['appliedForce', 'frictionForce'], function( appliedForce, frictionForce ) {
      var sameDirection = (appliedForce < 0 && frictionForce < 0) || (appliedForce > 0 && frictionForce > 0);
      motionView.frictionArrow.labelPosition = sameDirection ? 'bottom' : 'side';
    } );

    model.showForceProperty.linkAttribute( this.appliedForceArrow, 'visible' );
    model.showForceProperty.linkAttribute( this.frictionArrow, 'visible' );

    //After the view is constructed, move one of the blocks to the top of the stack.
    model.viewInitialized( this );
  }

  return inherit( ScreenView, MotionView, {

    //Get the height of the objects in the stack (doesn't include skateboard)
    get stackHeight() {
      var sum = 0;
      for ( var i = 0; i < this.model.stack.length; i++ ) {
        sum = sum + this.model.stack.get( i ).view.height;
      }
      return sum;
    },

    //Find the top of the stack, so that a new object can be placed on top
    get topOfStack() {
      var n = this.model.skateboard ? 335 : 360;
      return n - this.stackHeight;
    },

    //The aspect ratio that this sim was coded for differs by 7% than the one we eventually decided upon.
    //aspect ratio of this screen: 981/604=1.62
    //aspect ratio for default: 768/504=1.52
    //TODO: Rewrite the sim layout to use the standard bounds (lower priority)
    layoutBounds: new Bounds2( 0, 0, 981, 604 ),

    //Get the size of an item
    getSize: function( item ) { return {width: item.view.width, height: item.view.height}; }
  } );
} );
