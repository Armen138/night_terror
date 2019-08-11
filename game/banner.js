/* eslint-disable import/extensions */
/* eslint-disable no-restricted-syntax */
import chalk from 'chalk';
import titles from './titles.js';

const banner = {
  text: `@@@  @@@  @@@   @@@@@@@@  @@@  @@@  @@@@@@@     @@@@@@@  @@@@@@@@  @@@@@@@   @@@@@@@    @@@@@@   @@@@@@@ 
@@@@ @@@  @@@  @@@@@@@@@  @@@  @@@  @@@@@@@     @@@@@@@  @@@@@@@@  @@@@@@@@  @@@@@@@@  @@@@@@@@  @@@@@@@@  
@@!@!@@@  @@!  !@@        @@!  @@@    @@!         @@!    @@!       @@!  @@@  @@!  @@@  @@!  @@@  @@!  @@@  
!@!!@!@!  !@!  !@!        !@!  @!@    !@!         !@!    !@!       !@!  @!@  !@!  @!@  !@!  @!@  !@!  @!@  
@!@ !!@!  !!@  !@! @!@!@  @!@!@!@!    @!!         @!!    @!!!:!    @!@!!@!   @!@!!@!   @!@  !@!  @!@!!@!   
!@!  !!!  !!!  !!! !!@!!  !!!@!!!!    !!!         !!!    !!!!!:    !!@!@!    !!@!@!    !@!  !!!  !!@!@!    
!!:  !!!  !!:  :!!   !!:  !!:  !!!    !!:         !!:    !!:       !!: :!!   !!: :!!   !!:  !!!  !!: :!!   
:!:  !:!  :!:  :!:   !::  :!:  !:!    :!:         :!:    :!:       :!:  !:!  :!:  !:!  :!:  !:!  :!:  !:!  
 ::   ::   ::   ::: ::::  ::   :::     ::          ::     :: ::::  ::   :::  ::   :::  ::::: ::  ::   :::  
::    :   :     :: :: :    :   : :     :           :     : :: ::    :   : :   :   : :   : :  :    :   : :  `,
  colored() {
    const lines = banner.text.split('\n');
    const aligned = [];
    for (let line of lines) {
      if (line.length < 106) {
        line += ' '.repeat(106 - line.length);
      }
      aligned.push(titles.header(line, banner.width));
    }
    return chalk.red(aligned.join('\n'));
  },
  width: process.stdout.columns, // 106
};

export default banner;
