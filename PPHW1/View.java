import javax.swing.JPanel;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.io.File;
import javax.swing.JButton;
import java.awt.Color;
import java.util.ArrayList;

class View extends JPanel
{
	JButton b1;
	ArrayList<BufferedImage> images = new ArrayList<BufferedImage>();
	BufferedImage curr_image = null;

	Model model;

	View(Controller c, Model m)
	{

		// Link up to other objects
		c.setView(this);
		model = m;

		// Send mouse events to the controller
		this.addMouseListener(c);

		// Loads each image into array
		for (int i = 0; i < Game.Things.length; i++)
		{
			try
			{
				images.add(ImageIO.read(new File("images/"+Game.Things[i]+".png")));

			} catch(Exception e) {
				e.printStackTrace(System.err);
				System.exit(1);
			}
		}

	curr_image = images.get(0);

	}

	public void paintComponent(Graphics g)
	{

		// Clear the background
		g.setColor(new Color(128, 255, 50));
		g.fillRect(0, 0, this.getWidth(), this.getHeight());

		// Draw purple box
		g.setColor(new Color(230, 100, 250));
		g.fillRect(0, 0, 200, 200);
		

		//Draw the image so that its bottom center is at (x,y)
		int w = this.curr_image.getWidth();
		int h = this.curr_image.getHeight();
		g.drawImage(this.curr_image, model.curr_x - w / 2, model.curr_y - h, null);

		for(int i = 0; i < model.things.size(); i++)
		{
			g.drawImage(images.get(model.things.get(i).kind), (model.things.get(i).x), (model.things.get(i).y), null);
		}

	}
	
}
