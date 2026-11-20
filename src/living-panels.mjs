import {photos} from './data.mjs';
import {esc} from './components.mjs';

export const panelScenes = [
  {photo:14,title:'Foundations',description:'Excavation, reinforcement and formwork at ground level.',position:'50% 58%'},
  {photo:12,title:'Concrete frame',description:'The main structure takes shape, before the roof goes on.',position:'50% 52%'},
  {photo:15,title:'Brickwork',description:'Masonry and concrete define the ancillary building.',position:'50% 50%'},
  {photo:2,title:'Roof works',description:'Roof installation and exterior works continue above the site.',position:'50% 50%'},
  {photo:8,title:'Façade',description:'Roofing, finishes and the building envelope come together.',position:'50% 48%'},
  {photo:7,title:'Latest view',description:'A later view of the frontage and surrounding external areas.',position:'50% 54%'}
];

export function livingPanels(){
  return `<div class="living-story" data-living-story role="region" aria-label="Project stages in photographs" aria-describedby="panel-instructions">
    <p class="sr-only" id="panel-instructions">Six project scenes. Hover or focus to hold the animation. Select a scene to keep it open and browse manually. Use arrow keys, Home or End to choose a scene.</p>
    <div class="living-panels" role="group" aria-label="Choose a project scene">${panelScenes.map((scene,index)=>{
      const [width,height,alt]=photos[scene.photo],name=`image-${String(scene.photo).padStart(2,'0')}`;
      return `<button type="button" class="living-panel${index===0?' is-active':''}" data-living-panel="${index}" aria-pressed="${index===0}" aria-label="View ${esc(scene.title)} scene" style="--panel-focal:${scene.position}">
        <img src="/assets/${name}.webp" srcset="/assets/${name}-480.webp 480w, /assets/${name}-768.webp 768w, /assets/${name}.webp ${width}w" sizes="(max-width:680px) 90vw, 60vw" width="${width}" height="${height}" loading="lazy" decoding="async" alt="${esc(alt)}" data-photo-id="${scene.photo}">
        <span class="panel-caption"><span class="panel-title">${scene.title}</span><span class="panel-description">${scene.description}</span></span>
        <span class="panel-timer" aria-hidden="true"></span>
      </button>`;
    }).join('')}</div>
    <div class="panel-footer"><p class="panel-hint"><span class="pointer-hint">Hover to hold. </span>Select a scene to explore.</p><a class="text-link" href="/projects/education-facility">Explore the project</a></div>
    <p class="sr-only" role="status" aria-live="polite" data-panel-status></p>
  </div>`;
}
